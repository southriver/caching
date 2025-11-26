(async () => {
  const { getUsersCached } = require("./usersService");

  const users1 = await getUsersCached(); // hits DB
  const users2 = await getUsersCached(); // served from cache (within 60s)

  console.log(users1, users2);
})();
