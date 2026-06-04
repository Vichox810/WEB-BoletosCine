<template>
  <div id="center">
    <div class="hero">
      <img src="./assets/vite.svg" class="vite" alt="Vite logo" />
      <img src="./assets/hero.png" class="base" width="170" height="179" alt="" />
    </div>
    <div>
      <h1>Get started</h1>
      <p>
        Edit <code>src/App.vue</code> and save to test <code>HMR</code>
      </p>
    </div>
    <button
      type="button"
      class="counter"
      @click="count++"
    >
      Count is {{ count }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
