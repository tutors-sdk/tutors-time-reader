<script lang="ts">
  import { getContext, onDestroy } from "svelte";
  import type { CourseService } from "../services/course-service";
  import { currentLo, currentUser, live, studentsOnline } from "../stores";
  import type { StudentMetric, User } from "tutors-reader-lib/src/types/metrics-types";
  import { Topic } from "tutors-reader-lib/src/course/topic";
  import type { Lo } from "tutors-reader-lib/src/course/lo";
  import StudentCard from "../components/cards/StudentCard.svelte";
  import { querystring } from "svelte-spa-router";
  import { MetricsService } from "../services/metrics-service";
  import LoggedinStudentCard from "../components/cards/LoggedinStudentCard.svelte";
  import ClockCard from "../components/cards/ClockCard.svelte";

  let students: StudentMetric[] = [];
  export let params: any = {};
  const cache: CourseService = getContext("cache");
  const metricsService = getContext("metrics");
  let course = cache.course;
  let title = "";
  let status = false;

  async function getCourse(url) {
    let id = $querystring;
    live.set(true);
    course = await cache.fetchCourse(params.wild);
    metricsService.setCourse(course);
    // noinspection TypeScriptValidateTypes
    currentLo.set({
      title: `Tutors Live: ${course.lo.title}`,
      type: "tutorsLive",
      parentLo: course.lo,
      img: course.lo.img
    });
    title = `Tutors Live`;
    studentsOnline.set(0);
    metricsService.startListening(metricUpdate, metricDelete);
    const users = metricsService.getLiveUsers();
    users.forEach(user => {
      metricUpdate(user, null, null, Date.now());
    });
    studentsOnline.set(metricsService.getLiveCount());
    const user = await metricsService.fetchUserById(id);
    currentUser.set(user);
    status = user.onlineStatus === "offline";
    await metricsService.subscribeToAllUsers();
    return course;
  }

  onDestroy(async () => {
    metricsService.stopListening();
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
    studentsOnline.set(metricsService.getLiveCount());
  }

  function handleClick() {
    // analytics.setOnlineStatus(course, status);
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{#await getCourse(params.wild) then course}
  <div class="container mx-auto mt-4 mb-4 h-screen">
    <div class="col-span-6 wall-bg">
      {#each students as student}
        <StudentCard {student} />
      {/each}
    </div>
  </div>
{/await}


