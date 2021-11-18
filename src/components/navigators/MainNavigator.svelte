<script lang="ts">
  import TitleCard from "./support/TitleCard.svelte";
  import { currentCourse, live } from "../../stores";
  import DarkMode from "./support/ThemeSwitch.svelte";
  import LiveNavigator from "./support/LiveNavigator.svelte";
  import TutorsIcon from "./support/TutorsIcon.svelte";
  import { fly } from "svelte/transition";

  let version = "4.2.4";

</script>

{#if $currentCourse && $live}
  <LiveNavigator />
{:else}
  {#if $currentCourse}
    <div class="header-container">
      <div in:fly="{{ y: -100, duration: 1000 }}" out:fly="{{ y: -100, duration: 500 }}"
           class="navbar">
        <TitleCard />
        <TutorsIcon/>
        <DarkMode />
      </div>
    </div>
  {/if}
{/if}
