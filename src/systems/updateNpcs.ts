// Stage 3A: camp NPCs and visitors, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import {gameAudio} from '../../utils/helper';
import {INITIAL_GLADIATORS} from '../data/gladiators';
import {QUEST_CHAINS} from '../data/quests';
import type {Culture, DynamicVisitor} from '../types';
import type {UpdateView} from './view';

type UpdateVisitorTimerView = Pick<UpdateView, 'currentVisitor' | 'setCurrentVisitor'>;

export function updateVisitorTimer(view: UpdateVisitorTimerView, dt: number) {
  const {currentVisitor, setCurrentVisitor} = view;

  // Dynamic Camp Visitor timer & lifecycle
  if (currentVisitor) {
    currentVisitor.timer -= dt;
    if (currentVisitor.timer <= 0) {
      setCurrentVisitor(null);
    }
  }
}

type UpdateDevoteeView = Pick<
  UpdateView,
  | 'setGameState'
  | 'setDevoteeState'
  | 'devoteeStateRef'
  | 'campSpeechBubblesRef'
  | 'spawnCrispPopup'
>;

export function updateDevotee(view: UpdateDevoteeView, dt: number) {
  const {
    setGameState,
    setDevoteeState,
    devoteeStateRef,
    campSpeechBubblesRef,
    spawnCrispPopup,
  } = view;

  // 0. Update Zealous Devotee Camp Visitor
  if (devoteeStateRef.current.active) {
    const d = devoteeStateRef.current;
    d.animTimer += dt;
    if (d.speechTimer > 0) d.speechTimer -= dt;

    if (d.state === 'entering') {
      const dx = d.targetX - d.x;
      const dy = d.targetY - d.y;
      const dist = Math.hypot(dx, dy);
      d.flipX = dx < 0;

      if (dist > 3) {
        const moveSpeed = 34;
        d.x += (dx / dist) * moveSpeed * dt;
        d.y += (dy / dist) * moveSpeed * dt;
      } else {
        d.x = d.targetX;
        d.y = d.targetY;
        d.state = 'cheering';
        d.speechTimer = 6.0;

        if (!d.hasGiftedGold) {
          d.hasGiftedGold = true;
          const giftGold = Math.round((15 + Math.floor(Math.random() * 11)) * 0.8); // 20% reduced devotee tribute
          setGameState((prev) => ({ ...prev, gold: prev.gold + giftGold }));
          gameAudio.playCoinPickup();
          spawnCrispPopup(d.x, d.y - 18, `+${giftGold} Gold (Devotee Tribute)!`, '#fbbf24', true);
          campSpeechBubblesRef.current.push({
            id: `devotee_enter_${Date.now()}`,
            gladiatorId: 'devotee_npc',
            speakerName: 'Zealous Devotee',
            text: 'By the gods, the greatest lanista in all antiquity! I pledge my devotion and tribute!',
            timer: 4.8,
            maxDuration: 4.8,
          });
        }
      }
      setDevoteeState({ ...d });
    } else if (d.state === 'cheering') {
      if (d.speechTimer <= 0) {
        d.speechTimer = 10 + Math.random() * 10;
        const cheerLines = [
          'All hail our glorious champions!',
          'Strike with fury, my heroes! Rome sings your names!',
          'The sands shall remember our undefeated brotherhood!',
          'I have sworn eternal fidelity to this ludus!',
        ];
        const cLine = cheerLines[Math.floor(Math.random() * cheerLines.length)];
        campSpeechBubblesRef.current.push({
          id: `devotee_cheer_${Date.now()}`,
          gladiatorId: 'devotee_npc',
          speakerName: 'Zealous Devotee',
          text: cLine,
          timer: 3.8,
          maxDuration: 3.8,
        });
      }
    } else if (d.state === 'leaving') {
      const dx = d.targetX - d.x;
      const dy = d.targetY - d.y;
      const dist = Math.hypot(dx, dy);
      d.flipX = dx < 0;

      if (dist > 4) {
        const moveSpeed = 36;
        d.x += (dx / dist) * moveSpeed * dt;
        d.y += (dy / dist) * moveSpeed * dt;
        setDevoteeState({ ...d });
      } else {
        d.active = false;
        setDevoteeState({ ...d });
      }
    }
  }
}

type UpdateCourierView = Pick<
  UpdateView,
  | 'setCourierNpcState'
  | 'courierNpcRef'
  | 'setIsHeraldSummonsOpen'
  | 'isHeraldSummonsOpenRef'
  | 'closeAllCampModals'
>;

export function updateCourier(view: UpdateCourierView, dt: number) {
  const {
    setCourierNpcState,
    courierNpcRef,
    setIsHeraldSummonsOpen,
    isHeraldSummonsOpenRef,
    closeAllCampModals,
  } = view;

  // 0. Update Roman Civilian Courier Walking Physics & Arrival Sequence
  if (courierNpcRef.current.active) {
    const c = courierNpcRef.current;
    c.animTimer += dt;
    c.walkTimer += dt;
    if (c.speechTimer > 0) c.speechTimer -= dt;

    if (c.state === 'walking') {
      const dx = c.targetX - c.x;
      const dy = c.targetY - c.y;
      const dist = Math.hypot(dx, dy);
      c.flipX = dx < 0;

      if (!c.hasPlayedHorn && c.walkTimer >= 0.2) {
        c.hasPlayedHorn = true;
        gameAudio.playHeraldTrumpet();
      }

      if (dist > 4) {
        const moveSpeed = 38; // px / sec
        c.x += (dx / dist) * moveSpeed * dt;
        c.y += (dy / dist) * moveSpeed * dt;
        setCourierNpcState({ ...c });
      } else {
        // Reached threshold right at the lower-left doorway entrance (x: 65, y: 83)!
        c.x = c.targetX;
        c.y = c.targetY;
        c.state = 'at_tent';
        setCourierNpcState({ ...c });
        // Pause naturally right before the doorway, then cleanly transition before modal opens
        setTimeout(() => {
          courierNpcRef.current.active = false;
          setCourierNpcState((prev) => ({ ...prev, active: false }));
          closeAllCampModals();
          setIsHeraldSummonsOpen(true);
        }, 600);
      }
    } else if (c.state === 'at_tent') {
      // If summons modal is closed, courier departs
      if (!isHeraldSummonsOpenRef.current && c.walkTimer > 3.0) {
        c.state = 'departing';
        c.targetX = 330;
        c.targetY = 192;
        c.flipX = false;
      }
    } else if (c.state === 'departing') {
      const dx = c.targetX - c.x;
      const dy = c.targetY - c.y;
      const dist = Math.hypot(dx, dy);
      c.flipX = dx < 0;
      if (dist > 4) {
        const moveSpeed = 42;
        c.x += (dx / dist) * moveSpeed * dt;
        c.y += (dy / dist) * moveSpeed * dt;
      } else {
        c.active = false;
      }
      setCourierNpcState({ ...c });
    }
  }
}

type UpdateWalkingVisitorView = Pick<
  UpdateView,
  | 'setCurrentVisitor'
  | 'setIsVisitorModalOpen'
  | 'setVisitorWalkingNpc'
  | 'visitorWalkingNpcRef'
  | 'campSpeechBubblesRef'
>;

export function updateWalkingVisitor(view: UpdateWalkingVisitorView, dt: number) {
  const {
    setCurrentVisitor,
    setIsVisitorModalOpen,
    setVisitorWalkingNpc,
    visitorWalkingNpcRef,
    campSpeechBubblesRef,
  } = view;

  // 0. Update Dynamic Camp Visitor Walking NPC (Walks to lower-left tent doorway to activate visitor modal)
  if (visitorWalkingNpcRef.current?.active) {
    const v = visitorWalkingNpcRef.current;
    v.animTimer += dt;
    v.walkTimer += dt;

    if (v.state === 'walking') {
      const dx = v.targetX - v.x;
      const dy = v.targetY - v.y;
      const dist = Math.hypot(dx, dy);
      v.flipX = dx < 0;

      if (dist > 3) {
        const moveSpeed = v.visitor.type === 'rival' ? 36 : v.visitor.type === 'patron' ? 30 : 33;
        v.x += (dx / dist) * moveSpeed * dt;
        v.y += (dy / dist) * moveSpeed * dt;
        setVisitorWalkingNpc({ ...v });
      } else {
        // Reached lower-left tent doorway entrance threshold (x: 45, y: 83)!
        v.x = v.targetX;
        v.y = v.targetY;
        v.state = 'pausing_at_tent';
        v.flipX = true; // face tent doorway

        if (!v.hasSpoken) {
          v.hasSpoken = true;
          campSpeechBubblesRef.current.push({
            id: `visitor_speech_${Date.now()}`,
            gladiatorId: 'visitor_npc',
            speakerName: v.visitor.name,
            text: v.speechText,
            timer: 3.2,
            maxDuration: 3.2,
          });
          gameAudio.playFootstepStone();
        }
        setVisitorWalkingNpc({ ...v });
      }
    } else if (v.state === 'pausing_at_tent') {
      v.pauseTimer -= dt;
      if (v.pauseTimer <= 0) {
        v.state = 'entering_tent';
      }
      setVisitorWalkingNpc({ ...v });
    } else if (v.state === 'entering_tent') {
      v.y -= 14 * dt;
      if (v.y <= 74) {
        // Entered the tent! Activate the visitor event modal and notify lanista!
        v.active = false;
        setVisitorWalkingNpc(null);
        visitorWalkingNpcRef.current = null;
        setCurrentVisitor(v.visitor);
        setIsVisitorModalOpen(true);
        gameAudio.playPowerupChime();
      } else {
        setVisitorWalkingNpc({ ...v });
      }
    }
  }
}

type UpdatePhysicianView = Pick<
  UpdateView,
  | 'setPhysicianNpc'
  | 'physicianNpcRef'
  | 'setGladiators'
  | 'particlesRef'
  | 'campSpeechBubblesRef'
  | 'gladiatorsRef'
>;

export function updatePhysician(view: UpdatePhysicianView, dt: number) {
  const {
    setPhysicianNpc,
    physicianNpcRef,
    setGladiators,
    particlesRef,
    campSpeechBubblesRef,
    gladiatorsRef,
  } = view;

  // 0. Update Alexandrian Physician NPC Lifecycle, Pathing & Healing Aura (40 seconds)
  if (physicianNpcRef.current.active) {
    const p = physicianNpcRef.current;
    p.animTimer += dt;
    p.timer -= dt;

    // Roaming & Pathing behavior: seeks wounded fighters
    const livingGlads = gladiatorsRef.current.filter((g) => g.hp > 0 && !g.hidden);
    const woundedGlads = livingGlads.filter((g) => g.hp < g.maxHp);

    if (p.state === 'entering') {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);
      p.flipX = dx < 0;
      if (dist > 3) {
        const speed = 36;
        p.x += (dx / dist) * speed * dt;
        p.y += (dy / dist) * speed * dt;
      } else {
        p.state = 'roaming';
      }
    } else if (p.state === 'roaming') {
      if (p.timer <= 3.0) {
        p.state = 'departing';
        p.targetX = 18;
        p.targetY = 110;
      } else {
        // Seek wounded fighters or stroll between gladiators
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.hypot(dx, dy);
        p.flipX = dx < 0;

        if (dist > 4) {
          const speed = 32;
          p.x += (dx / dist) * speed * dt;
          p.y += (dy / dist) * speed * dt;
        } else {
          // Pick new target location near a wounded gladiator or around courtyard
          if (woundedGlads.length > 0) {
            const sortedWounded = [...woundedGlads].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
            const targetWounded = sortedWounded[0];
            p.targetX = Math.max(45, Math.min(285, targetWounded.x + (Math.random() > 0.5 ? 16 : -16)));
            p.targetY = Math.max(95, Math.min(160, targetWounded.y + (Math.random() > 0.5 ? 8 : -8)));
          } else if (livingGlads.length > 0) {
            const randomGlad = livingGlads[Math.floor(Math.random() * livingGlads.length)];
            p.targetX = Math.max(45, Math.min(285, randomGlad.x + (Math.random() > 0.5 ? 20 : -20)));
            p.targetY = Math.max(95, Math.min(160, randomGlad.y + (Math.random() > 0.5 ? 10 : -10)));
          } else {
            p.targetX = 65 + Math.random() * 180;
            p.targetY = 95 + Math.random() * 60;
          }
        }
      }
    } else if (p.state === 'departing') {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);
      p.flipX = dx < 0;
      if (dist > 3) {
        const speed = 34;
        p.x += (dx / dist) * speed * dt;
        p.y += (dy / dist) * speed * dt;
      }
    }

    // HEALING AURA: Every 1.0 second, any gladiator within healing radius (60 canvas units) whose HP < max HP receives +5 HP!
    p.healTickTimer -= dt;
    if (p.healTickTimer <= 0) {
      p.healTickTimer = 1.0;
      let anyHealed = false;

      const updatedGlads = gladiatorsRef.current.map((g) => {
        if (g.hp <= 0 || g.hidden) return g;
        const distToDoc = Math.hypot(g.x - p.x, g.y - p.y);
        if (distToDoc <= 60 && g.hp < g.maxHp) {
          anyHealed = true;
          const nextHp = Math.min(g.maxHp, g.hp + 5);
          const wasLowHp = (g.hp / g.maxHp) < 0.35;

          // Gentle green/gold cross healing particles emit from healed gladiators
          for (let i = 0; i < 4; i++) {
            particlesRef.current.push({
              x: g.x + (Math.random() - 0.5) * 8,
              y: g.y - 10 + (Math.random() - 0.5) * 6,
              color: Math.random() < 0.6 ? '#4ade80' : '#ded095',
              vx: (Math.random() - 0.5) * 6,
              vy: -12 - Math.random() * 8,
              life: 0.6,
              maxLife: 0.6,
              size: 2,
            });
          }

          // Grateful reactive dialogue from gladiators being healed (chance per tick if not speaking)
          if (
            campSpeechBubblesRef.current.length < 2 &&
            !campSpeechBubblesRef.current.some((b) => b.gladiatorId === g.id) &&
            Math.random() < 0.35
          ) {
            let thankLine = '';
            if (wasLowHp) {
              const lowLines = [
                'I thought I was bound for the underworld... thank you, healer.',
                'By the gods, I could feel the cold coming on. You pulled me back.',
                "Don't let them drag me to the corpse pit just yet!",
              ];
              thankLine = lowLines[Math.floor(Math.random() * lowLines.length)];
            } else {
              const generalLines = [
                "Ah, the stinging means it's working.",
                'My shoulder moves again, praise Apollo.',
                'Good draught, herbalist.',
              ];
              thankLine = generalLines[Math.floor(Math.random() * generalLines.length)];
            }

            campSpeechBubblesRef.current.push({
              id: `healed_react_${Date.now()}_${g.id}`,
              gladiatorId: g.id,
              speakerName: g.name.split(' ')[0],
              text: thankLine,
              timer: 3.5,
              maxDuration: 3.5,
            });
          }

          return { ...g, hp: nextHp };
        }
        return g;
      });

      if (anyHealed) {
        gladiatorsRef.current = updatedGlads;
        setGladiators(updatedGlads);
      }
    }

    // RARE HUMOROUS INTERACTION (once per visit, ~8% chance between 12s and 28s remaining):
    // "one person can very rarely randomly ask if he's a real doctor and he'll say no."
    if (!p.didHumorCheck && p.timer <= 28.0 && p.timer >= 12.0) {
      p.didHumorCheck = true;
      if (Math.random() < 0.08) {
        const nearbyGlads = livingGlads.filter((g) => Math.hypot(g.x - p.x, g.y - p.y) < 70);
        const questioner = nearbyGlads.length > 0 ? nearbyGlads[0] : livingGlads[0];
        if (questioner) {
          campSpeechBubblesRef.current.push({
            id: `humor_q_${Date.now()}`,
            gladiatorId: questioner.id,
            speakerName: questioner.name.split(' ')[0],
            text: 'Wait... are you actually an ordained doctor?',
            timer: 3.5,
            maxDuration: 3.5,
          });

          setTimeout(() => {
            const deadpanLines = [
              'No. Mostly I just sew sails and cauterize pigs.',
              "By Zeus, no. I used to be an undertaker's apprentice.",
            ];
            const deadpan = deadpanLines[Math.floor(Math.random() * deadpanLines.length)];
            campSpeechBubblesRef.current.push({
              id: `humor_a_${Date.now()}`,
              gladiatorId: 'physician_npc',
              speakerName: 'Physician',
              text: deadpan,
              timer: 4.5,
              maxDuration: 4.5,
            });
          }, 2200);
        }
      }
    }

    // Physician Speech Bubbles (every 6-8s)
    p.speechTimer -= dt;
    if (p.speechTimer <= 0) {
      p.speechTimer = 6.0 + Math.random() * 2.0;
      if (campSpeechBubblesRef.current.length < 2) {
        const docLines = [
          'Hold still, let the willow bark draw the fever out.',
          'Clean linen and sharp steel—that’s how we save limbs!',
          'Breathe deep of this smoke, it numbs the torn sinew.',
          'The sand takes blood, but my tinctures give it back.',
        ];
        const chosenDocLine = docLines[Math.floor(Math.random() * docLines.length)];
        campSpeechBubblesRef.current.push({
          id: `physician_speak_${Date.now()}`,
          gladiatorId: 'physician_npc',
          speakerName: 'Physician',
          text: chosenDocLine,
          timer: 4.0,
          maxDuration: 4.0,
        });
      }
    }

    // Conclude after 40 seconds
    if (p.timer <= 0) {
      p.active = false;
      campSpeechBubblesRef.current.push({
        id: `physician_depart_${Date.now()}`,
        gladiatorId: 'physician_npc',
        speakerName: 'Physician',
        text: 'My herbs are spent for now. Fight well, champions of the sand!',
        timer: 3.5,
        maxDuration: 3.5,
      });
    }
    setPhysicianNpc({ ...p });
  }
}

type UpdateMerchantView = Pick<
  UpdateView,
  | 'setMerchantState'
  | 'merchantStateRef'
  | 'setArmoryTab'
  | 'campSpeechBubblesRef'
>;

export function updateMerchant(view: UpdateMerchantView, dt: number) {
  const {setMerchantState, merchantStateRef, setArmoryTab, campSpeechBubblesRef} = view;

  // 0. Update Traveling Nomad Merchant State Machine & Walking Physics
  if (merchantStateRef.current.active) {
    const m = merchantStateRef.current;
    m.animTimer += dt;

    if (m.state === 'entering') {
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      const dist = Math.hypot(dx, dy);

      m.flipX = dx < 0;

      if (dist > 3) {
        const moveSpeed = 30; // logic pixels per sec
        m.x += (dx / dist) * moveSpeed * dt;
        m.y += (dy / dist) * moveSpeed * dt;
      } else {
        // Arrived at sitting spot
        m.x = m.targetX;
        m.y = m.targetY;
        m.state = 'sitting';
        m.sitTimer = 25.0; // Sits for ~25s
        if (!m.hasPlayedSitSpeech) {
          m.hasPlayedSitSpeech = true;
          campSpeechBubblesRef.current.push({
            id: `merchant_sit_${Date.now()}`,
            gladiatorId: 'merchant_npc',
            speakerName: 'Nomad Merchant',
            text: 'Exotic wares from the Eastern deserts! Trade with the caravan!',
            timer: 4.5,
            maxDuration: 4.5,
          });
          gameAudio.playPowerupChime();
        }
      }
      setMerchantState({ ...m });
    } else if (m.state === 'sitting') {
      m.sitTimer -= dt;
      if (m.sitTimer <= 0) {
        m.state = 'leaving';
        m.targetX = 335;
        m.targetY = 115;
        if (!m.hasPlayedDepartSpeech) {
          m.hasPlayedDepartSpeech = true;
          campSpeechBubblesRef.current.push({
            id: `merchant_leave_${Date.now()}`,
            gladiatorId: 'merchant_npc',
            speakerName: 'Nomad Merchant',
            text: 'The dunes beckon my caravan forward. Farewell, Dominus!',
            timer: 3.5,
            maxDuration: 3.5,
          });
        }
      }
      setMerchantState({ ...m });
    } else if (m.state === 'leaving') {
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      const dist = Math.hypot(dx, dy);

      m.flipX = dx < 0;

      if (dist > 4) {
        const moveSpeed = 32;
        m.x += (dx / dist) * moveSpeed * dt;
        m.y += (dy / dist) * moveSpeed * dt;
      } else {
        m.active = false;
        setArmoryTab((tab) => (tab === 'bazaar' ? 'armoria' : tab));
      }
      setMerchantState({ ...m });
    }
  }
}

type UpdateCourierArrivalsView = Pick<
  UpdateView,
  | 'courierNotice'
  | 'setCourierNotice'
  | 'courierTimerRef'
  | 'unlockedChains'
  | 'storyStateRef'
>;

export function updateCourierArrivals(view: UpdateCourierArrivalsView, dt: number, isAnyModalOrNoticeActive: boolean) {
  const {courierNotice, setCourierNotice, courierTimerRef, unlockedChains, storyStateRef} = view;

  // Random courier visits in camp (every 50-80s)
  if (!isAnyModalOrNoticeActive && storyStateRef.current.phase === 'inactive' && !courierNotice) {
    courierTimerRef.current -= dt;
    if (courierTimerRef.current <= 0) {
      courierTimerRef.current = 50 + Math.random() * 30;
      const availableChains = QUEST_CHAINS.filter(
        (c) => unlockedChains.includes(c.id),
      );
      if (availableChains.length > 0) {
        const picked = availableChains[Math.floor(Math.random() * availableChains.length)];
        setCourierNotice({
          chainId: picked.id,
          speaker: picked.speaker,
          title: picked.title,
          nodeId: picked.startNodeId,
        });
        gameAudio.playHoverMicroTone();
      }
    }
  }
}

type UpdateVisitorArrivalsView = Pick<
  UpdateView,
  | 'currentVisitor'
  | 'visitorTimerRef'
  | 'setVisitorWalkingNpc'
  | 'visitorWalkingNpcRef'
  | 'storyStateRef'
>;

export function updateVisitorArrivals(view: UpdateVisitorArrivalsView, dt: number, isAnyModalOrNoticeActive: boolean) {
  const {
    currentVisitor,
    visitorTimerRef,
    setVisitorWalkingNpc,
    visitorWalkingNpcRef,
    storyStateRef,
  } = view;

  // Dynamic Camp Visitors (Merchants, Scouts, Patrons, Rivals)
  // When ready, visitor NPC walks from bottom entrance towards tent entrance (x: 75, y: 72)
  if (!isAnyModalOrNoticeActive && storyStateRef.current.phase === 'inactive' && !currentVisitor && !visitorWalkingNpcRef.current?.active) {
    visitorTimerRef.current -= dt;
    if (visitorTimerRef.current <= 0) {
      visitorTimerRef.current = 45 + Math.random() * 30;
      const vTypes: ('merchant' | 'scout' | 'patron' | 'rival')[] = ['merchant', 'scout', 'patron', 'rival'];
      const vType = vTypes[Math.floor(Math.random() * vTypes.length)];

      let visitor: DynamicVisitor;
      let characteristicSpeech = '';

      if (vType === 'merchant') {
        visitor = {
          id: `visitor_${Date.now()}`,
          type: 'merchant',
          name: 'Apothecary Septimus',
          title: 'Traveling Alchemist',
          greeting: 'Rare draughts distilled from Numidian herbs and dragon marrow, lanista!',
          offerText: "Lion's Blood Tonic: +3 STR permanently to all living fighters (110 Gold).",
          cost: 110,
          attributeBoost: { type: 'str', val: 3, name: "Lion's Blood Tonic" },
          timer: 30.0,
        };
        characteristicSpeech = 'I bring exotic draughts from Alexandria!';
      } else if (vType === 'scout') {
        const cultures: Culture[] = ['roman', 'celt', 'berber', 'scythian', 'hunnic'];
        const pickedCult = cultures[Math.floor(Math.random() * cultures.length)];
        const recruitTmpl = INITIAL_GLADIATORS.find((g) => g.culture === pickedCult) || INITIAL_GLADIATORS[0];
        visitor = {
          id: `visitor_${Date.now()}`,
          type: 'scout',
          name: 'Lucius the Slave Trader',
          title: 'Prodigy Scout',
          greeting: 'I discovered a prodigy fighter in the provinces with rare raw genetics!',
          offerText: `Purchase high-potential recruit ${recruitTmpl.name.split(' ')[0]} with elevated base stats (130 Gold).`,
          cost: 130,
          scoutRecruit: {
            ...recruitTmpl,
            id: `scout_${pickedCult}_${Date.now()}`,
            name: `Prodigy ${recruitTmpl.name.split(' ')[0]}`,
            title: 'Scouted Prodigy',
            level: 2,
            baseAttack: recruitTmpl.attack + 5,
            baseDefense: recruitTmpl.defense + 3,
            attack: recruitTmpl.attack + 5,
            defense: recruitTmpl.defense + 3,
            attributes: { str: 16, dex: 15, vit: 15, con: 15, wil: 15 },
            traits: ['Resilient', 'Proud'],
          },
          timer: 30.0,
        };
        characteristicSpeech = 'New flesh from the northern borders, Lanista!';
      } else if (vType === 'patron') {
        visitor = {
          id: `visitor_${Date.now()}`,
          type: 'patron',
          name: 'Senator Gracchus',
          title: 'Wealthy Patrician Patron',
          greeting: 'Your champions bring honor to the games! Take this purse to sponsor their training.',
          offerText: 'Accept a generous political gift (+140 Gold).',
          reward: 140,
          rewardText: '+140 Gold Gift',
          timer: 30.0,
        };
        characteristicSpeech = 'A private wager for your finest swords!';
      } else {
        visitor = {
          id: `visitor_${Date.now()}`,
          type: 'rival',
          name: 'Lanista Tullius',
          title: 'Rival Ludus Master',
          greeting: 'They chant your name, but my fighters could snap your men like twigs! Care to wager?',
          offerText: 'Place 120G underground wager on your next battle victory for 300G return!',
          cost: 120,
          reward: 300,
          rewardText: 'Underground Wager (Win next match for 300G!)',
          timer: 30.0,
        };
        characteristicSpeech = 'Think your champions can match my legion?';
      }

      // Spawn unique walking visitor NPC moving toward lower-left tent doorway
      visitorWalkingNpcRef.current = {
        active: true,
        visitor,
        x: 165,
        y: 192,
        targetX: 45,
        targetY: 83,
        state: 'walking',
        pauseTimer: 2.2,
        speechText: characteristicSpeech,
        hasSpoken: false,
        animTimer: 0,
        flipX: true,
        walkTimer: 0,
      };
      setVisitorWalkingNpc({ ...visitorWalkingNpcRef.current });
    }
  }
}
