<template>
  <div>
    <div class="flex gap-3 justify-center">
      <div class="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{{ display[0] }}</div>
      <div class="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{{ display[1] }}</div>
      <div class="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{{ display[2] }}</div>
    </div>
    <button @click="draw">Draw</button>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';
import { range, shuffle } from 'lodash-es';
import { defineProps, defineEmits, reactive, watch } from 'vue';

const props = defineProps<{ target: number }>();
const emit = defineEmits(['draw', 'animation-start', 'animation-end']);

const display = reactive(['0', '0', '0']);

watch(() => props.target, (newTarget) => {
  emit('animation-start');
  const targetString = newTarget.toString().padStart(3, '0');
  const targetNumbers = targetString.split('').map(Number);

  const animateData = range(0, 3).map(i => {
    const shuffled = i === 0 ? shuffle(range(0, 4)) : shuffle(range(0, 10));
    const targetIndex = shuffled.indexOf(targetNumbers[i]);
    const ticks = 10 * (i + 7) + targetIndex;  // Assuming 10 spins before stopping at target
    return { shuffled, ticks };
  });

  const startTicks = [0, 0, 0];

  const onUpdate = () => {
    animateData.forEach((datum, i) => {
      const displayIndex = Math.round(startTicks[i]) % datum.shuffled.length;
      display[i] = datum.shuffled[displayIndex].toString();
    });
  };

  const onComplete = () => {
    emit('animation-end');
  };

  gsap.timeline({ onUpdate, onComplete })
    .to(startTicks, { '0': animateData[0].ticks, duration: 5 }, 0)
    .to(startTicks, { '1': animateData[1].ticks, duration: 6 }, 0)
    .to(startTicks, { '2': animateData[2].ticks, duration: 7 }, 0);
});

const draw = () => {
  emit('draw');
};
</script>
