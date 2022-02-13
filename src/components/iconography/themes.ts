import { FluentIconLib } from "./fluent-icons";
import { currentCourse } from "../../stores";
import type { IconType } from "../../reader-lib/types/icon-types";

let StandardIconLib = FluentIconLib;

export function setIconLib(iconLib: any) {
  StandardIconLib = iconLib;
}

export const themes = ["tutors", "tutors-dark", "tutors-dyslexia", "black"];

export const themeIcons = {
  "tutors": FluentIconLib,
  "tutors-dark": FluentIconLib,
  "tutors-dyslexia": FluentIconLib,
  "black": FluentIconLib,
};

export function getIcon(type: string): IconType {
  let icon: IconType = StandardIconLib.default;
  if (currentIconLib[type]) {
    icon = currentIconLib[type];
  } else {
    if (StandardIconLib[type]) {
      icon = StandardIconLib[type];
    }
  }
  return icon;
}

export let currentIconLib: any = StandardIconLib;

currentCourse.subscribe(course => {
  if (course && course.lo && course.lo.properties.iconset) {
    currentIconLib = course.lo.properties.iconset;
  } else {
    currentIconLib = StandardIconLib;
  }
});
