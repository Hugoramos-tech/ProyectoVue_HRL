<template>
  <!-- ======================= ZONA TEMPLATE ===========================
       Componente de EJEMPLO de la UD2 (reactividad).
       No forma parte de ninguna ruta: se deja como chuleta de ref,
       reactive y computed.
  ================================================================== -->
  <div class="exemplo">
    <!-- @click es la forma corta de v-on:click -->
    <button class="button" @click="aumentar">+</button>
    <button class="button" @click="restar">-</button>

    <!-- {{ }} = interpolación: pinta el valor y se actualiza solo -->
    <p>Valor: {{ contador }}</p>

    <h5>Paciente</h5>
    <p>Nombre: {{ paciente.nombre }}</p>
    <p>Puntuación: {{ paciente.puntuacion }}</p>
    <p>Estado: {{ estadoPaciente }}</p>
  </div>
</template>

<script setup>
// ======================== ZONA SCRIPT ===============================
import { ref, reactive, computed } from 'vue'

// ref      -> para valores sueltos (números, textos, booleanos).
//             Dentro del script se accede con .value; en el template NO.
const contador = ref(0);

// reactive -> para OBJETOS. Se accede a sus campos sin .value
const paciente = reactive({
  nombre: 'Xosé',
  puntuacion: 0
})

// Funciones que modifican el estado: al cambiar, Vue vuelve a pintar solo
// las partes del template que usan esos datos (eso es la REACTIVIDAD).
const aumentar = () => {
  contador.value++
  paciente.puntuacion++
}

const restar = () => {
  contador.value--
  paciente.puntuacion--
}

// computed -> valor CALCULADO a partir de otros datos reactivos.
// Se recalcula solo cuando cambia algo de lo que depende (la puntuación).
const estadoPaciente = computed(() => {
  if (paciente.puntuacion >= 5) return "Paciente estado grave"
  if (paciente.puntuacion < 5) return "Paciente estado leve"
  else return "Paciente estado desconocido"
})
</script>

<style scoped>
.exemplo {
  text-align: center;
  padding: 1rem;
}

.button {
  background: none;
  border: 2px solid #ddd;
  cursor: pointer;
  font-size: 1rem;
  margin: 0 0.25rem;
  padding: 0.25rem 0.75rem;
}
</style>
