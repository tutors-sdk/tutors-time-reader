<script lang="ts">
  import { getContext, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import LabTime from "./support/LabTime.svelte";
  import InstructorLabTime from "./support/InstructorLabTime.svelte";
  import CalendarTime from "./support/CalendarTime.svelte";
  import InstructorCalendarTime from "./support/InstructorCalendarTime.svelte";
  import type { Course } from "tutors-reader-lib/src/course/course";
  import type { CourseService } from "../services/course-service";
  import { currentLo } from "../stores";
  // @ts-ignore
  import { Tab, TabList, TabPanel, Tabs } from "svelte-tabs";
  import { getUserId } from "tutors-reader-lib/src/utils/auth-utils";
  import {location, querystring} from 'svelte-spa-router'
  export let params: any = {};

  let instructorMode = false;
  let course: Course = null;
  const cache: CourseService = getContext("cache");
  let title = "";
  let pinBuffer = "";
  let ignorePin = "";

  //const id = getUserId();
  window.addEventListener("keydown", keypressInput);
  let id = "";
  async function getCourse(url) {
    console.log(params);
    console.log($querystring);
    id = $querystring;
    course = await cache.fetchCourse(url);
    // noinspection TypeScriptValidateTypes
    currentLo.set({ title: `Tutors Time`, type: "tutorsTime", parentLo: course.lo, img: course.lo.img });
    title = `Tutors Time`;
    if (course.lo.properties.ignorepin) {
      ignorePin = "" + course.lo.properties.ignorepin;
    }
    return course;
  }

  function keypressInput(e) {
    pinBuffer = pinBuffer.concat(e.key);
    if (pinBuffer === ignorePin) {
      instructorMode = true;
    }
  }

  onDestroy(async () => {
    window.removeEventListener("keydown", keypressInput);
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css" />
  <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-balham.css" />
</svelte:head>

{#await getCourse(params.wild) then course}
  <div in:fade={{ duration: 500 }} class="bg-base-200 mt-4 container mx-auto rounded-box">
    <Tabs>
      <TabList>
        <Tab> Labs</Tab>
        <Tab> Calendar</Tab>
        {#if instructorMode}
          <Tab> Labs All Students</Tab>
          <Tab> Calendar All Students</Tab>
        {/if}
      </TabList>

      <TabPanel>
        <LabTime {id} />
      </TabPanel>
      <TabPanel>
        <CalendarTime {id} />
      </TabPanel>
      {#if instructorMode}
        <TabPanel>
          <InstructorLabTime />
        </TabPanel>
        <TabPanel>
          <InstructorCalendarTime />
        </TabPanel>
      {/if}
    </Tabs>
  </div>
{/await}
