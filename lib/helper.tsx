export function convertTo12Hour(time: string) {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(+hour);
    date.setMinutes(+minute);
    const period = +hour < 12 ? 'AM' : 'PM';
    const hour12 = +hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
}

export function formatDate(dateString: string) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export interface Post {
    [key: string]: any;
    post_id: string;
    id: string;
    title: string;
    description: string;
    location: string;
    date: Date;
    organizer: string;
    avatar_url: string;
    going: string[];
  }

  export interface coordinates {
    lat: number;
    lng: number;
  }

export async function GetGeocode(location: string) {
    const apiKey = 'AIzaSyDIUUi4YaXewTJH-4RO5SWli8ddpjGHezg'; 
    const options = {method: 'GET', headers: {accept: '*/*', }};
    const location_param = location.replace(/,/g, '%20').replace(/ /g, '%20')

    let result = {} as coordinates

    console.log(location_param)
    await fetch(`https://maps.googleapis.com/maps/api/geocode/json?&address=${location_param}&key=${apiKey}`, options)
    .then(response => 
      response.json())
    .then(response => {
        if(response.status == "ZERO_RESULTS") {
          return;
        }
        result = response.results[0].geometry.location as coordinates
    })
    .catch(err => console.error(err));  
    return result
  
}