<template>
  <!-- Vista informativa con los servicios; las imagenes salen de public/assets/images. -->
  <main class="flex flex-1 flex-col gap-8 rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-8">
    <header class="mx-auto max-w-3xl text-center">
      <p class="mb-3 text-xs font-bold tracking-[0.14em] text-[#397c70] uppercase">
        Atención integral
      </p>
      <h1 class="mb-3 text-3xl font-extrabold tracking-tight text-[#153f2e] sm:text-4xl">
        Nuestros servicios
      </h1>
      <p class="text-base leading-7 text-[#64737a]">
        Un equipo preparado para cuidar de ti y de tu familia en cada etapa.
      </p>
    </header>

    <section
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Servicios de la clínica"
    >
      <article
        v-for="servicio in servicios"
        :key="servicio.titulo"
        class="overflow-hidden rounded-2xl border border-[#e1e9e7] bg-white shadow-[0_5px_18px_rgba(20, 60, 45,0.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(20, 60, 45,0.12)]"
      >
        <img
          class="h-52 w-full object-cover"
          :src="servicio.imagen"
          :alt="servicio.textoAlternativo"
          loading="lazy"
        >
        <div class="p-5">
          <h2 class="mb-2 text-xl font-bold text-[#153f2e]">
            {{ servicio.titulo }}
          </h2>
          <p class="text-sm leading-6 text-[#64737a]">
            {{ servicio.descripcion }}
          </p>
        </div>
      </article>
    </section>

    <!-- La licencia CC BY obliga a citar al autor de las fotos, por eso va este pie. -->
    <p class="text-center text-xs leading-5 text-[#8a9a9f]">
      Fotografías de
      <a
        class="underline hover:text-[#28695e]"
        href="https://www.flickr.com/photos/202780880@N02"
        target="_blank"
        rel="noopener"
      >nenad53</a>
      (<a
        class="underline hover:text-[#28695e]"
        href="https://creativecommons.org/licenses/by/2.0/"
        target="_blank"
        rel="noopener"
      >CC BY 2.0</a>) y de StockSnap.io (CC0).
    </p>
  </main>
</template>

<script setup>
const servicios = [
  {
    titulo: 'Medicina General y Consultas',
    descripcion: 'Tu primera puerta de entrada: revisiones, diagnóstico y seguimiento con el médico de siempre.',
    imagen: '/assets/images/01.MedicinaGeneral.jpg',
    textoAlternativo: 'Médico con bata y fonendoscopio consultando una tableta'
  },
  {
    titulo: 'Laboratorio y Análisis Clínicos',
    descripcion: 'Extracciones y pruebas rápidas en el propio centro, con los resultados listos en poco tiempo.',
    imagen: '/assets/images/02.Laboratorio.jpg',
    textoAlternativo: 'Profesional sanitaria sosteniendo una prueba rápida sobre la mesa de consulta'
  },
  {
    titulo: 'Odontología y Salud Bucodental',
    descripcion: 'Revisiones, limpiezas y tratamientos dentales, con mucha paciencia para los más pequeños.',
    imagen: '/assets/images/03.Odontologia.jpg',
    textoAlternativo: 'Odontóloga revisando la boca de un niño en el sillón dental'
  },
  {
    titulo: 'Fisioterapia y Rehabilitación',
    descripcion: 'Terapia manual y ejercicio guiado para recuperar la movilidad después de una lesión.',
    imagen: '/assets/images/04.Fisioterapia.jpg',
    textoAlternativo: 'Hombre mayor haciendo un estiramiento guiado por un fisioterapeuta'
  },
  {
    titulo: 'Pediatría y Atención Infantil',
    descripcion: 'Controles del niño sano, vacunas y consultas para resolver las dudas de cada etapa.',
    imagen: '/assets/images/05.Pediatria.jpg',
    textoAlternativo: 'Profesional sanitaria auscultando la espalda de una niña'
  },
  {
    titulo: 'Diagnóstico por Imagen y Ecografías',
    descripcion: 'Radiografías y ecografías que interpreta nuestro propio equipo para confirmar el diagnóstico.',
    imagen: '/assets/images/06.DiagnosticoImagen.jpg',
    textoAlternativo: 'Profesional sanitaria observando una radiografía a contraluz'
  }
]
</script>
