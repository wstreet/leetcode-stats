import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import themes from "./themes";
import { ascSort } from "../utils";

dayjs.extend(weekOfYear);

type Data = {
  [key: string]: number;
};
type Themes = "dark" | "light";

type CommitsData = {
  date: string;
  commits: number;
  color: string;
  month: number;
  day: number; // day of week
  week: number;
  x: number;
  y: number;
};

class Card {
  private commitsData: CommitsData[] = [];
  private days: number;
  private theme: Themes = "light";
  private unit = 12;
  private offsetX = 8;
  private offsetY = 8;

  constructor(data: Data, theme: Themes) {
    if (theme) {
      this.setTheme(theme);
    }
    this.calcDays();
    this.setCommitsData(data);
  }

  private calcDays() {
    const day = dayjs().day();
    // 52 weeks in a year
    this.days = 51 * 7 + day + 1;
  }

  private setCommitsData(data: Data) {
    const completeData = this.getCompleteData(data);
    const stamps = Object.keys(completeData);

    const sortStamps = ascSort(stamps);
    let x = 0;
    const commitsData = sortStamps.map((stamp, idx) => {
      const date = dayjs(Number(stamp) * 1000);
      const day = date.day();

      return {
        date: date.format("YYYY-MM-DD"),
        commits: completeData[stamp],
        month: date.month() + 1,
        day,
        week: date.week(),
        color: this.getColor(completeData[stamp]),
        x: day === 6 ? x++ : x,
        y: day,
      };
    });

    this.commitsData = commitsData;
  }

  private getColor(commits: number): string {
    if (commits <= 0) {
      return themes[this.theme].none;
    } else if (commits <= 3) {
      return themes[this.theme].less;
    } else if (commits <= 6) {
      return themes[this.theme].medium;
    } else if (commits <= 10) {
      return themes[this.theme].height;
    } else {
      return themes[this.theme].more;
    }
  }

  private getCompleteData(data: Data): Data {
    const completeData = {};
    const today = new Date();
    today.setHours(16, 0, 0, 0); // TODO: fix hours
    const todayStamp = today.getTime() / 1000;
    for (let index = 0; index < this.days; index++) {
      const dateKey = this.getDateKey(todayStamp, index);
      completeData[dateKey] = data[dateKey] || 0;
    }
    // console.log(JSON.stringify(completeData));
    return completeData;
  }

  private getDateKey(stamp: number, diff: number): string {
    return (stamp - 86400 * diff).toString();
  }

  private renderDays() {
    return this.commitsData
      .map((item) => {
        return `
          <rect
            x="${item.x * this.unit + this.offsetX}"
            y="${item.y * this.unit + this.offsetY}"
            width="10"
            height="10"
            fill="${item.color}"
            rx="2"
            ry="2"
            data-commits="${item.commits}"
            title="${`${item.commits} commits on ${item.date}`}"
          ></rect>
        `;
      })
      .reverse()
      .join("");
  }

  public setTheme(theme: Themes) {
    this.theme = theme;
  }

  public render() {
    return `
      <svg 
        version="1.1"
        baseProfile="full"
        width="640" height="100"
        xmlns="http://www.w3.org/2000/svg"
        style="${`border:1px solid #d0d7de;background:${
          themes[this.theme].bg
        }; border-radius:4px`}"
      >
        <g style="text-align:center">${this.renderDays()}</g>
      </svg>
    `;
  }
}

export default Card;
