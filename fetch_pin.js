fetch('https://www.pinterest.com/pin/55309901668968725/').then(r => r.text()).then(t => console.log([...t.matchAll(/src="([^"]+)"/g)].map(m => m[1]).filter(url => url.includes('pinimg'))))
