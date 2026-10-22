const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.siteSetting.update({ where: { key: "portalsTitle" }, data: { value: "All Worlds" } });
  const hero = await p.siteSetting.findUnique({ where: { key: "heroSub" } });
  if (hero?.value?.startsWith("Eight interconnected worlds")) {
    await p.siteSetting.update({ where: { key: "heroSub" }, data: { value: hero.value.replace("Eight interconnected worlds", "Nine interconnected worlds") } });
  }
  console.log("DB updated");
  await p.$disconnect();
})();
