<template>
    <div>
        <h1>My Vue App</h1>
        <p v-if="!data">Loading...</p>
        <pre v-else>{{ data }}</pre>
    </div>
</template>

<script>
    export default {
        data() {
            return { data: null };
        },
        async mounted() {
            const res = await fetch("/api/home/1/10")
            this.data = await res.json();
        },
    };
</script>