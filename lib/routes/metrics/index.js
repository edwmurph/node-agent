const Router = require('@koa/router');
const exec = require('../../util/exec');

const router = new Router({ prefix: '/metrics' });

async function getTemp() {
  try {
    const res = await exec('cat /sys/class/thermal/thermal_zone0/temp').catch( console.error );
    const celcius = parseInt( res.stdout.trim(), 10) / 1000;
    return celcius;
  } catch ( ex ) {
    console.error('failed to get temp:', ex);
    throw ex;
  }
}

router.get('/', async (ctx) => {
  const metrics = [
    `node_temp_celcius ${ await getTemp() }`
  ].join('\n');

  ctx.body = metrics;
});

module.exports = router;
