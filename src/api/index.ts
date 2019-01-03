import { Bakery } from 'src/redux/bakery';

const API_DELAY_MS = 3000;


const grandmaBakery: Bakery = {
  id: 'grandma',
  name: 'Grandma\'s Kitchen',
  cookiesPerSec: 0.1,
  cookieCost: 15,
};

const amateurBakery: Bakery = {
  id: 'amateur',
  name: 'Amateur Bakery',
  cookiesPerSec: 1,
  cookieCost: 100,
};

const professionalBakery: Bakery = {
  id: 'professional',
  name: 'Professional Bakery',
  cookiesPerSec: 10,
  cookieCost: 500,
};


export const fetchBakeries = (): Promise<Bakery[]> => {
  return new Promise(((resolve) => {
    setInterval(() => {
      resolve([
        grandmaBakery,
        amateurBakery,
        professionalBakery,
      ]);
    }, API_DELAY_MS);
  }))
};
