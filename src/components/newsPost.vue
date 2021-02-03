<template>
  <article class="newsPost">
    <header>
      <h1 class="title">
        <slot name="title"/>
      </h1>
      <span class="date">{{date}}</span>
      <span class="version">{{version}}</span>
    </header>
    <main>
      <p class="content">
        <slot name="content"/>
      </p>
    </main>
  </article>
</template>

<script>
export default {
  name: "newsPost",

  props: ["date", "version"]
};
</script>
