import * as cheerio from "cheerio";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
const response = await fetch(
  "https://www.foundit.in/search/sql-jobs?searchId=8b34f9fd-3deb-4910-be49-3febf4e67861"
);
// "https://www.foundit.in/search/work-from-home-jobs?searchId=3f5e9fcd-2807-4d6a-8835-4c2b89b466fa"

const file = Bun.file("./data/jobs.json");
const data = await file.json();

// "https://apna.co/jobs?location_id=1&location_identifier=1&location_type=CustomLocation&location_name=Anywhere%20in%20India&search=true&text=Software%20Developer&entity_id=259&entity_type=JobTitle"

const html = await response.text();

const $ = cheerio.load(html);

// let jobs = [];
// const links = $("a")
//   .map((i, el) => $(el).attr("href"))
//   .get();
// const title = $("h3")
//   .map((i, el) => $(el).text())
//   .get();
// console.log("Links: ", links);
// console.log("Title: ", title);
// console.log("Links length: ", links.length);
const filePath = join(process.cwd(), "data", "jobs.json");
//   await mkdir(dirname(filePath), { recursive: true });

// const jsonString = JSON.stringify(
//   {
//     links,
//     title,
//     time: new Date().toISOString(),
//   },
//   null,
//   2
// );

// const contents = await file.json();
// console.log(contents);

function scrapeJobData(html: string) {
  const jobData: {
    title: string;
    company: string;
    location: string;
    experience: string;
    salary: string;
    skills: any[];
    jobType: string[];
    postedAgo: string;
    jobId: string | undefined;
    url: string | undefined;
    kiwiJobId: string;
  }[] = [];

  $(".srpResultCardContainer").each((index, element) => {
    const job = {
      title: $(element).find(".jobTitle a").text().trim(),
      company: $(element)
        .find(".companyName span")
        .text()
        .trim()
        .replace("â€“", "-")
        .trim(),
      location: $(element)
        .find(".addEllipsis .details span")
        .map((i, el) => $(el).text().trim())
        .get()
        .join(", "),

      experience: $(element)
        .find('.addEllipsis:contains("years")')
        .text()
        .trim(),
      salary: $(element)
        .find('.bodyRow:contains("INR") .details')
        .text()
        .trim(), 
      skills: [] as any,
      jobType: $(element)
        .find('.addEllipsis:contains("Job") span')
        .map((i, el) => $(el).text().trim())
        .get(),
      postedAgo: $(element).find(".timeText").text().trim(),
      jobId: $(element).attr("id"),
      url: $(element).find(".jobTitle a").attr("href"),
      kiwiJobId: $(element)
        .find(".jobTitle a")
        .attr("onclick")!
        .match(/"(\d+)"/)![1], // Extract kiwiJobId from onclick attribute
    };

    $(element)
      .find(".skillDetails .grey-link span")
      .each((skillIndex, skillElement) => {
        job.skills.push($(skillElement).text().trim());
      });

    jobData.push(job);
  });

  return jobData;
}

const scrapedData = scrapeJobData(html);
await Bun.write(filePath, JSON.stringify(
        scrapedData
    , null, 2));

// console.log(scrapedData);
