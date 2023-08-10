<template>
  <h1>Nuxt Rate Limit Playground</h1>
  <p>
    Test each rate limited endpoint by clicking the button in each section multiple times and
    looking at the response.
  </p>

  <div class="group">
    <p>url: /api/hello</p>
    <p>maxRequests: 2</p>
    <p>intervalSeconds: 10</p>
    <p>response: {{ helloResponse }}</p>
    <button @click="hello()">Send request to /hello</button>
    <div class="group" v-if="helloPayload">
      <pre v-html="JSON.stringify(helloPayload)" />
    </div>
  </div>

  <div class="group">
    <p>url: /api/goodbye</p>
    <p>maxRequests: 10</p>
    <p>intervalSeconds: 60</p>
    <p>response: {{ goodbyeResponse }}</p>
    <button @click="goodbye()">Send request to /goodbye</button>
  </div>

</template>

<script setup lang="ts">
import { ref } from '#imports'

const helloResponse = ref('')
const goodbyeResponse = ref('')
const helloPayload = ref({})

async function hello() {
  helloResponse.value = ''

  try {
    const response = await $fetch.raw('/api/hello')
    helloPayload.value = {
      current: response.headers.get('x-ratelimit-current'),
      limit: response.headers.get('x-ratelimit-limit'),
      reset: response.headers.get('x-ratelimit-reset'),
    }
    helloResponse.value = response._data
  } catch (error: any) {
    helloResponse.value = error.statusMessage
  }
}

async function goodbye() {
  goodbyeResponse.value = ''

  try {
    const response = await $fetch('/api/goodbye')
    goodbyeResponse.value = response
  } catch (error: any) {
    goodbyeResponse.value = error.statusMessage
  }
}
</script>

<style>
body {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol,
    Noto Color Emoji;
}
</style>

<style scoped>
p {
  margin: 0;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 500px;
  background: #fafafa;
  border-radius: 10px;
  padding: 10px;
  margin-top: 20px;
}
code {
  background: #fafafa;
  border-radius: 5px;
}
button {
  background: #000;
  color: #fff;
  border-radius: 5px;
  padding: 10px;
  outline: none;
  cursor: pointer;
}
button:hover {
  opacity: 0.7;
}
</style>
