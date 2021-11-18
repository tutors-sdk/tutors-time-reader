<script lang="ts">
  import { getContext, onDestroy } from "svelte";
  import type { CourseService } from "../services/course-service";
  import { currentLo, live, studentsOnline } from "../stores";
  import type { StudentMetric, User } from "tutors-reader-lib/src/analytics/metrics-types";
  //import { AnalyticsService } from "../services/analytics-service";
  import { getUserId } from "tutors-reader-lib/src/utils/auth-utils";
  import { Topic } from "tutors-reader-lib/src/course/topic";
  import type { Lo } from "tutors-reader-lib/src/course/lo";
  import StudentCard from "../components/cards/StudentCard.svelte";

  let students: StudentMetric[] = [];
  export let params: any = {};
  const cache: CourseService = getContext("cache");
  //const analytics: AnalyticsService = getContext("analytics");

  let course = cache.course;
  let title = "";
  let status = false;

  async function getCourse(url) {
    live.set(true);
    course = await cache.fetchCourse(params.wild);
    // noinspection TypeScriptValidateTypes
    currentLo.set({
      title: `Tutors Live: ${course.lo.title}`,
      type: "tutorsLive",
      parentLo: course.lo,
      img: course.lo.img
    });
    title = `Tutors Live`;
    studentsOnline.set(0);
    course.metricsService.startListening(metricUpdate, metricDelete);
    const users = course.metricsService.getLiveUsers();
    users.forEach(user => {
      metricUpdate(user, null, null, Date.now());
    });
    studentsOnline.set(course.metricsService.getLiveCount());
    const user = await course.metricsService.fetchUserById(getUserId());
    status = user.onlineStatus === "offline";
    await course.metricsService.subscribeToAllUsers();
    return course;
  }

  onDestroy(async () => {
    cache.course.metricsService.stopListening();
  });

  function metricDelete(user: User) {
    let student = students.find(student => student.nickname === user.nickname);
    let index = students.indexOf(student);
    if (index !== -1) {
      students.splice(index, 1);
    }
    students = [...students];
  }

  function metricUpdate(user: User, topic: Topic, lab: Lo, time: number) {
    if (user.onlineStatus === "offline") return;
    let student = students.find(student => student.nickname === user.nickname);
    if (!student) {
      student = {
        name: user.name,
        nickname: user.nickname,
        img: user.picture,
        topic: null,
        lab: null,
        time: time
      };
      students.push(student);
    }
    student.time = time;
    if (topic) {
      student.topic = topic;
    }
    if (lab) {
      student.lab = lab;
    }
    students = [...students];
    studentsOnline.set(course.metricsService.getLiveCount());
  }

  function handleClick() {
   // analytics.setOnlineStatus(course, status);
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{#await getCourse(params.wild) then course}
  <div class="container mx-auto mt-4 mb-4  h-screen">
    <div class="wall-bg">
      <div id="tsparticles"></div>
      {#each students as student}
        <StudentCard {student} />
      {/each}
    </div>
  </div>
{/await}
