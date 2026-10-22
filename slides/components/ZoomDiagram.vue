<!--
  A diagram you can zoom and pan live. It always starts fitted, so nothing is cut off.
  Scroll or pinch to zoom at the pointer, drag to move, double-click or "Fit" to reset.
  <ZoomDiagram src="/mcp-roles.svg" height="230px" alt="…" />
-->
<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{ src: string; alt?: string; height?: string }>(), { alt: '', height: '400px' });

const box = ref<HTMLDivElement>();
const k = ref(1);
const x = ref(0);
const y = ref(0);
const MAX = 8;
let drag: { id: number; px: number; py: number } | undefined;

// Slidev scales the whole slide with a CSS transform, so convert screen pixels to the box's own pixels.
function local(clientX: number, clientY: number) {
  const el = box.value!;
  const r = el.getBoundingClientRect();
  const s = el.offsetWidth / r.width;
  return { px: (clientX - r.left) * s, py: (clientY - r.top) * s, s };
}

// Keep at least part of the diagram in view: no panning past its edges.
function clamp() {
  const el = box.value!;
  x.value = Math.min(0, Math.max(el.offsetWidth * (1 - k.value), x.value));
  y.value = Math.min(0, Math.max(el.offsetHeight * (1 - k.value), y.value));
}

function zoomAt(factor: number, px: number, py: number) {
  const next = Math.min(MAX, Math.max(1, k.value * factor));
  const f = next / k.value;
  x.value = px - (px - x.value) * f;
  y.value = py - (py - y.value) * f;
  k.value = next;
  clamp();
}

function zoom(factor: number) {
  const el = box.value!;
  zoomAt(factor, el.offsetWidth / 2, el.offsetHeight / 2);
}

function reset() {
  k.value = 1;
  x.value = 0;
  y.value = 0;
}

function onWheel(e: WheelEvent) {
  const { px, py } = local(e.clientX, e.clientY);
  // Pinch on a trackpad arrives as a wheel event with ctrlKey and small deltas.
  zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), px, py);
}

function onDown(e: PointerEvent) {
  if (e.button !== 0) return;
  drag = { id: e.pointerId, px: e.clientX, py: e.clientY };
  box.value!.setPointerCapture(e.pointerId);
}

function onMove(e: PointerEvent) {
  if (!drag || drag.id !== e.pointerId) return;
  const { s } = local(e.clientX, e.clientY);
  x.value += (e.clientX - drag.px) * s;
  y.value += (e.clientY - drag.py) * s;
  drag.px = e.clientX;
  drag.py = e.clientY;
  clamp();
}

function onUp() {
  drag = undefined;
}
</script>

<template>
  <div
    ref="box"
    class="zoom-diagram"
    :class="{ zoomed: k > 1 }"
    :style="{ height: props.height }"
    @wheel.prevent.stop="onWheel"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @dblclick="reset"
  >
    <img :src="props.src" :alt="props.alt" draggable="false" :style="{ transform: `translate(${x}px, ${y}px) scale(${k})` }" />
    <div class="zoom-controls" @pointerdown.stop @dblclick.stop>
      <button title="Zoom in" @click="zoom(1.5)">+</button>
      <button title="Zoom out" @click="zoom(1 / 1.5)">−</button>
      <button title="Fit the whole diagram" @click="reset">Fit</button>
    </div>
  </div>
</template>

<style scoped>
.zoom-diagram {
  position: relative;
  width: 100%;
  margin: 0.5rem auto 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.zoom-diagram:active { cursor: grabbing; }
.zoom-diagram img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: 0 0;
}
.zoom-controls {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.zoom-diagram:hover .zoom-controls,
.zoom-diagram.zoomed .zoom-controls { opacity: 1; }
.zoom-controls button {
  min-width: 2rem;
  padding: 0 0.4rem;
  font: 500 0.85rem/2rem var(--slidev-theme-font-mono, ui-monospace, monospace);
  color: var(--paper, #f4eee3);
  background: var(--ink-surface-2, #211d17);
  border: 1px solid var(--ink-line, #3d3528);
  border-radius: 4px;
  cursor: pointer;
}
.zoom-controls button:hover { border-color: var(--accent, #d9744e); }
</style>
