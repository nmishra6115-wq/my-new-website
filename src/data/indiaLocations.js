export const INDIA_STATES_AND_UTS = [
  // 28 States
  { name: 'Andhra Pradesh', code: 'AP', category: 'State', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada'] },
  { name: 'Arunachal Pradesh', code: 'AR', category: 'State', cities: ['Itanagar', 'Naharlagun', 'Tawang', 'Pasighat'] },
  { name: 'Assam', code: 'AS', category: 'State', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur'] },
  { name: 'Bihar', code: 'BR', category: 'State', cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'] },
  { name: 'Chhattisgarh', code: 'CG', category: 'State', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Durg'] },
  { name: 'Goa', code: 'GA', category: 'State', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'] },
  { name: 'Gujarat', code: 'GJ', category: 'State', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'GIFT City'] },
  { name: 'Haryana', code: 'HR', category: 'State', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Karnal', 'Ambala'] },
  { name: 'Himachal Pradesh', code: 'HP', category: 'State', cities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi'] },
  { name: 'Jharkhand', code: 'JH', category: 'State', cities: ['Ranchi', 'Jamshedpur', 'Bokaro', 'Dhanbad'] },
  { name: 'Karnataka', code: 'KA', category: 'State', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'] },
  { name: 'Kerala', code: 'KL', category: 'State', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'] },
  { name: 'Madhya Pradesh', code: 'MP', category: 'State', cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'] },
  { name: 'Maharashtra', code: 'MH', category: 'State', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai'] },
  { name: 'Manipur', code: 'MN', category: 'State', cities: ['Imphal', 'Churachandpur', 'Thoubal'] },
  { name: 'Meghalaya', code: 'ML', category: 'State', cities: ['Shillong', 'Tura', 'Jowai'] },
  { name: 'Mizoram', code: 'MZ', category: 'State', cities: ['Aizawl', 'Lunglei', 'Champhai'] },
  { name: 'Nagaland', code: 'NL', category: 'State', cities: ['Kohima', 'Dimapur', 'Mokokchung'] },
  { name: 'Odisha', code: 'OD', category: 'State', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'] },
  { name: 'Punjab', code: 'PB', category: 'State', cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
  { name: 'Rajasthan', code: 'RJ', category: 'State', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
  { name: 'Sikkim', code: 'SK', category: 'State', cities: ['Gangtok', 'Namchi', 'Gyalshing'] },
  { name: 'Tamil Nadu', code: 'TN', category: 'State', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { name: 'Telangana', code: 'TS', category: 'State', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Secunderabad'] },
  { name: 'Tripura', code: 'TR', category: 'State', cities: ['Agartala', 'Udaipur', 'Dharmanagar'] },
  { name: 'Uttar Pradesh', code: 'UP', category: 'State', cities: ['Noida', 'Lucknow', 'Ghaziabad', 'Kanpur', 'Varanasi', 'Agra', 'Greater Noida'] },
  { name: 'Uttarakhand', code: 'UK', category: 'State', cities: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee'] },
  { name: 'West Bengal', code: 'WB', category: 'State', cities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'] },

  // 8 Union Territories
  { name: 'Andaman and Nicobar Islands', code: 'AN', category: 'Union Territory', cities: ['Port Blair'] },
  { name: 'Chandigarh', code: 'CH', category: 'Union Territory', cities: ['Chandigarh'] },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN', category: 'Union Territory', cities: ['Daman', 'Silvassa', 'Diu'] },
  { name: 'Delhi', code: 'DL', category: 'Union Territory', cities: ['New Delhi', 'Connaught Place', 'Dwarka', 'Saket', 'Nehru Place'] },
  { name: 'Jammu and Kashmir', code: 'JK', category: 'Union Territory', cities: ['Srinagar', 'Jammu', 'Anantnag'] },
  { name: 'Ladakh', code: 'LA', category: 'Union Territory', cities: ['Leh', 'Kargil'] },
  { name: 'Lakshadweep', code: 'LD', category: 'Union Territory', cities: ['Kavaratti', 'Agatti'] },
  { name: 'Puducherry', code: 'PY', category: 'Union Territory', cities: ['Puducherry', 'Karaikal', 'Mahe'] },
];

export const ALTERNATIVE_CITY_SPELLINGS = {
  bangalore: { city: 'Bengaluru', state: 'Karnataka' },
  bengaluru: { city: 'Bengaluru', state: 'Karnataka' },
  mysore: { city: 'Mysuru', state: 'Karnataka' },
  mysuru: { city: 'Mysuru', state: 'Karnataka' },
  mangalore: { city: 'Mangaluru', state: 'Karnataka' },
  mangaluru: { city: 'Mangaluru', state: 'Karnataka' },
  bombay: { city: 'Mumbai', state: 'Maharashtra' },
  mumbai: { city: 'Mumbai', state: 'Maharashtra' },
  pune: { city: 'Pune', state: 'Maharashtra' },
  nagpur: { city: 'Nagpur', state: 'Maharashtra' },
  calcutta: { city: 'Kolkata', state: 'West Bengal' },
  kolkata: { city: 'Kolkata', state: 'West Bengal' },
  madras: { city: 'Chennai', state: 'Tamil Nadu' },
  chennai: { city: 'Chennai', state: 'Tamil Nadu' },
  coimbatore: { city: 'Coimbatore', state: 'Tamil Nadu' },
  hyderabad: { city: 'Hyderabad', state: 'Telangana' },
  secunderabad: { city: 'Secunderabad', state: 'Telangana' },
  gurgaon: { city: 'Gurugram', state: 'Haryana' },
  gurugram: { city: 'Gurugram', state: 'Haryana' },
  'new delhi': { city: 'New Delhi', state: 'Delhi' },
  delhi: { city: 'New Delhi', state: 'Delhi' },
  'delhi ncr': { city: 'New Delhi', state: 'Delhi' },
  ncr: { city: 'New Delhi', state: 'Delhi' },
  noida: { city: 'Noida', state: 'Uttar Pradesh' },
  'greater noida': { city: 'Greater Noida', state: 'Uttar Pradesh' },
  lucknow: { city: 'Lucknow', state: 'Uttar Pradesh' },
  ranchi: { city: 'Ranchi', state: 'Jharkhand' },
  jamshedpur: { city: 'Jamshedpur', state: 'Jharkhand' },
  bokaro: { city: 'Bokaro', state: 'Jharkhand' },
  ahmedabad: { city: 'Ahmedabad', state: 'Gujarat' },
  'gift city': { city: 'GIFT City', state: 'Gujarat' },
  kochi: { city: 'Kochi', state: 'Kerala' },
  cochin: { city: 'Kochi', state: 'Kerala' },
  trivandrum: { city: 'Thiruvananthapuram', state: 'Kerala' },
  thiruvananthapuram: { city: 'Thiruvananthapuram', state: 'Kerala' },
  jaipur: { city: 'Jaipur', state: 'Rajasthan' },
  bhubaneswar: { city: 'Bhubaneswar', state: 'Odisha' },
  chandigarh: { city: 'Chandigarh', state: 'Chandigarh' },
  indore: { city: 'Indore', state: 'Madhya Pradesh' },
  bhopal: { city: 'Bhopal', state: 'Madhya Pradesh' },
};

const CITY_TO_STATE_LOOKUP = (() => {
  const map = new Map();
  for (const [alias, target] of Object.entries(ALTERNATIVE_CITY_SPELLINGS)) {
    map.set(alias.toLowerCase(), { city: target.city, state: target.state });
  }
  for (const region of INDIA_STATES_AND_UTS) {
    map.set(region.name.toLowerCase(), { city: null, state: region.name });
    for (const c of region.cities) {
      const key = c.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { city: c, state: region.name });
      }
    }
  }
  return map;
})();

export function normalizeIndiaLocation(rawLocation = '', rawState = '') {
  const cleanedRaw = String(rawLocation || '').trim();
  const cleanedState = String(rawState || '').trim();

  if (/^remote$/i.test(cleanedRaw)) {
    return {
      city: null,
      state: cleanedState || null,
      country: 'India',
      remoteEligibility: 'remote',
      displayLocation: 'Remote (India)',
    };
  }

  if (cleanedState) {
    const matchedRegion = INDIA_STATES_AND_UTS.find(
      (r) => r.name.toLowerCase() === cleanedState.toLowerCase() || r.code.toLowerCase() === cleanedState.toLowerCase()
    );
    if (matchedRegion) {
      const cityLookup = CITY_TO_STATE_LOOKUP.get(cleanedRaw.toLowerCase());
      const resolvedCity = cityLookup?.city || (cleanedRaw || null);
      return {
        city: resolvedCity,
        state: matchedRegion.name,
        country: 'India',
        remoteEligibility: 'unspecified',
        displayLocation: resolvedCity ? `${resolvedCity}, ${matchedRegion.name}` : matchedRegion.name,
      };
    }
  }

  const lower = cleanedRaw.toLowerCase();
  const direct = CITY_TO_STATE_LOOKUP.get(lower);
  if (direct) {
    return {
      city: direct.city,
      state: direct.state,
      country: 'India',
      remoteEligibility: 'unspecified',
      displayLocation: direct.city ? `${direct.city}, ${direct.state}` : direct.state,
    };
  }

  for (const [token, info] of CITY_TO_STATE_LOOKUP.entries()) {
    if (lower.includes(token)) {
      return {
        city: info.city,
        state: info.state,
        country: 'India',
        remoteEligibility: 'unspecified',
        displayLocation: info.city ? `${info.city}, ${info.state}` : info.state,
      };
    }
  }

  return {
    city: cleanedRaw || null,
    state: cleanedState || null,
    country: 'India',
    remoteEligibility: 'unspecified',
    displayLocation: cleanedRaw || cleanedState || 'India',
  };
}

export function getCitiesForState(stateName) {
  if (!stateName || stateName === 'All India') return [];
  const region = INDIA_STATES_AND_UTS.find((r) => r.name === stateName);
  return region ? [...region.cities] : [];
}
