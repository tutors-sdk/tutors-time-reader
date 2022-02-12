import { child, get, getDatabase, ref } from "firebase/database";

export async function fetchAllCourseList() {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, "all-course-access"));
  const courseList: any[] = [];
  if (snapshot.exists()) {
    const courseObjs: any = snapshot.val();
    for (const [key, value] of Object.entries(courseObjs)) {
      const course: any = value;
      course.url = key;
      courseList.push(course);
    }
    courseList.sort((a, b) => Number(b.visits) - Number(a.visits));
  }
  return courseList;
}

export function deleteCourseFromList(url: string) {
  // let ref = firebase.database().ref(`all-course-access/${url}`);
  // ref.remove();
}
