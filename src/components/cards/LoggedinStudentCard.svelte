<script lang="ts">
  import { cardTransition } from "../animations";
  import { currentUser } from "../../stores";
  import type { User } from "../../reader-lib/types/metrics-types";
  import { getContext } from "svelte";
  let status = false;
  let user: User;

  const metricsService = getContext("metrics");

  function handleClick() {
    metricsService.setOnlineStatus(user, status);
  }

  currentUser.subscribe(async course => {
    user = await $currentUser;
    status = user?.onlineStatus === "offline";
  });
</script>

{#if user}
  <div transition:cardTransition class="tutorscard w-32 h-32 border-info">
    <div class="card-title text-base-content text-xs -mb-1"> {user.name}</div>
    <figure class="flex justify-center">
      <img loading="lazy" class="object-scale-down p-1 h-20" src="{user.picture}" alt="{user.nickname}">
    </figure>
    <div class="text-xs flex text-base-content  -mb-2">
      Appear Offline &nbsp <input type="checkbox" bind:checked={status} on:click={handleClick}>
    </div>
  </div>
{/if}
