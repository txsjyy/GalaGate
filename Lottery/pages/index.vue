<template>
  <div>
  <Navbar current-page=""></Navbar>
  <div class="flex h-screen bg-center bg-no-repeat bg-cover bg-hero-pattern">
    <!-- <sponsorBanner1></sponsorBanner1> -->
    <div class="absolute top-4 w-screen text-center">
    <!-- Display data once it's loaded -->
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
    <main class="m-auto mt-60 w-1/2 min-w-fit overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur bg-white bg-opacity-60">
      <div class="center_column">
        <DigitDisplay
        class="my-8"
        :target="dispNum1"
        @animation-start="loading = true"
        @animation-end="onAnimationEnd()"
        @draw="drawSpecific(1)"
        />
        <DigitDisplay
        class="my-8"
        :target="dispNum2"
        @animation-start="loading = true"
        @animation-end="onAnimationEnd()"
        />
      </div>
      <div class="center_column">
        <DigitDisplay
        class="my-8"
        :target="dispNum3"
        @animation-start="loading = true"
        @animation-end="onAnimationEnd()"
        />
        <div class="flex justify-center my-8">
          <button
            @click="draw()"
            :disabled="loading"
            :class="{
              'bg-gray-300': loading,
              'bg-red-500 hover:bg-red-600 active:bg-red-700 active:shadow-inner shadow-md': !loading,
            }"
            class="text-white text-5xl font-medium rounded-full px-8 py-2 transition-all duration-200 disabled:cursor-wait"
          >
          {{ loading ? 'Loading...' : 'Draw' }}
          </button>
          <button @click="saveNumbers">Save</button>
        </div>
      </div>
      <div class="center_column">
        <DigitDisplay
        class="my-8"
        :target="dispNum4"
        @animation-start="loading = true"
        @animation-end="onAnimationEnd()"
        />
        <DigitDisplay
        class="my-8"
        :target="dispNum"
        @animation-start="loading = true"
        @animation-end="onAnimationEnd()"
        />
      </div>
    </main>
    <!-- <sponsorBanner2></sponsorBanner2> -->
    <footer class="absolute bottom-4 w-screen text-center">
      <span class="text-slate-800">&copy; <strong>UTCSSA</strong> - Junyu Yao and Tech Department, 2024.</span>
    </footer>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const data = ref(null)
const error = ref<string | null>(null)
const loading = ref<boolean>(false)
const lotteryNumbers = ref<number[]>([])
const dispNum = ref<number>(0)
const dispNum1 = ref<number>(0)
const dispNum2 = ref<number>(0)
const dispNum3 = ref<number>(0)
const dispNum4 = ref<number>(0)

const fetchLotteryNumbers = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:8080/api/lottery-numbers')
    if (!response.ok) throw new Error('Failed to fetch lottery numbers')
    lotteryNumbers.value = await response.json()
    console.log(lotteryNumbers.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : "An unexpected error occurred"
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchLotteryNumbers()
})

const drawNumber = () => {
  if (lotteryNumbers.value.length === 0) {
    alert('No more numbers to draw')
    return 0
  }
  const index = Math.floor(Math.random() * lotteryNumbers.value.length)
  const number = lotteryNumbers.value[index]
  lotteryNumbers.value.splice(index, 1)
  return number
}

const draw = () => {
  loading.value = true;
  const refs = [dispNum, dispNum1, dispNum2, dispNum3, dispNum4];

  refs.forEach(ref => {
    ref.value = drawNumber();
  });

  loading.value = false;
}

// Save function
const saveNumbers = async () => {
  const numbersToSave = [dispNum.value, dispNum1.value, dispNum2.value, dispNum3.value, dispNum4.value]
  try {
    const response = await fetch('http://localhost:8080/api/save-numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numbers: numbersToSave }),
    })
    if (!response.ok) throw new Error('Failed to save numbers')
    alert('Numbers saved successfully')
  } catch (err) {
    console.error(err)
  }
}

const dispNumRefs = ref([dispNum1, dispNum2, dispNum3, dispNum4, dispNum]);

const drawSpecific = (index: number) => {
  loading.value = true;
  const number = drawNumber();
  dispNumRefs.value[index].value = number;
  loading.value = false;
};

const { $confetti } = useNuxtApp().vueApp.config.globalProperties

const confettiSettings = {
  particlesPerFrame: 2,
  defaultDropRate: 15,
  particles: [{ type: 'circle' }, { type: 'heart' }, { type: 'rect' }]
}

const onAnimationEnd = () => {
  loading.value = false
  $confetti.start(confettiSettings)
  setTimeout(() => {
    $confetti.stop()
  }, 2000)
}
</script>

<style>
.column {
  float: left;
  width: 25%;
  padding: 10px;
}
.center_column {
  float: left;
  width: 33.3%;
  padding: 15px;
}

</style>