import {
  createLinkedinPost,
  extractTagsAndSeries,
  generateMarkdownPost,
  getDynamicCategories,
  getTitleForCategory,
} from "./ai";
import { publishToDevto } from "./devto";
import { sharePostOnLinkedIn } from "./linkedin";
import { publishToMedium } from "./medium";
import { sendEmail } from "./sendEmail";
import { retry } from "./utils";

export async function dailyContentBlast(
  purposes: string[],
  competencies: string[]
) {
  try {
    console.log("📚 Kategoriler alınıyor...");
    const categories = await retry(() => getDynamicCategories(purposes));

    const category = categories[Math.floor(Math.random() * categories.length)];
    console.log("🎯 Seçilen kategori:", category);

    const title = await retry(() => getTitleForCategory(category));
    console.log("📝 Başlık:", title);

    const markdown = await retry(() =>
      generateMarkdownPost(title, competencies)
    );
    console.log("✍️ Yazı oluşturuldu, yayınlanıyor...");

    const { tags, series } = await retry(() => extractTagsAndSeries(markdown));

    // const mediumUrl = await retry(() =>
    //   publishToMedium(title, markdown, tags, series)
    // );

    // console.log("🔗 Medium yayını oluşturuldu." );

    const devToUrl = await retry(() =>
      publishToDevto(title, markdown, tags, series)
    );

    const linkedinText = await retry(() =>
      createLinkedinPost(markdown, devToUrl, tags, title, series)
    );
    console.log("🔗 LinkedIn paylaşım metni oluşturuldu.");

    const linkedinResponse = await retry(() =>
      sharePostOnLinkedIn(linkedinText)
    );

    await sendEmail(
      `✅ Yeni İçerik Yayınlandı: ${title}`,
      `Yeni yazı başarıyla yayınlandı.\n\n` +
        `📅 Yayınlanma Tarihi: ${new Date().toLocaleString("tr-TR")}\n` +
        `📝 Başlık: ${title}\n` +
        `🔗 Dev.to Linki: ${devToUrl}\n` +
        // `🔗 Medium Linki: ${mediumUrl}\n` +
        `📣 LinkedIn Durumu: ${linkedinResponse.id}`
    );
  } catch (err) {
    console.error("🚨 Sistem durdu:", err);

    let errorMessage = "";
    if (err instanceof Error) {
      errorMessage = `Hata yeri:\n${err.stack}`;
      errorMessage += `\n\nHata mesajı:\n${err.message}`;
    } else {
      errorMessage = `Hata mesajı (tipi tanımsız):\n${JSON.stringify(err)}`;
    }

    await sendEmail(
      `🚨 Hata! Post Paylaşılamadı ${new Date().toLocaleString("tr-TR")}`,
      `Hata mesajı:\n${errorMessage}`
    );
  }
}
