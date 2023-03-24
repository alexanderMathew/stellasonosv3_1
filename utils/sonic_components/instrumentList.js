
/*
 The ordering of this instrument list (ie. which number gets assigned to each instrument)
 is determined by how high or low the instrument usually is. 
 From the image, we want to map brighter objects to a brighter/higher instrument, 
 and the darker objects to a darker/lower instrument.
*/ 
const instrumentList = {
  1: {
    "id": "contrabass",
    "name" : "contrabass",
    "baseOctave" : 1,
    "baseNote": "C",
    "range" : 2,
  },
  2: {
    "id": "tuba",
    "name" : "tuba",
    "baseOctave" : 2,
    "baseNote": "D",
    "range" : 1
  },
  3: {
    "id": "cello",
    "name" : "cello",
    "baseOctave" : 3,
    "baseNote": "C",
    "range" : 2
  },
  4: {
    "id": "trombone",
    "name" : "trombone",
    "baseOctave" : 2,
    "baseNote": "As",
    "range" : 2
  }, 
  5: {
    "id": "bassoon",
    "name" : "bassoon",
    "baseOctave" : 2,
    "baseNote": "C",
    "range" : 2
  },
  6: {
    "id": "frenchHorn",
    "name" : "french-horn",
    "baseOctave" : 3,
    "baseNote": "C",
    "range" : 2
  },
  7: {
    "id": "trumpet",
    "name" : "trumpet",
    "baseOctave" : 2,
    "baseNote": "A",
    "range" : 2
  },   
  8: {
    "id": "saxophone",
    "name" : "saxophone",
    "baseOctave": 3,
    "baseNote": "C",
    "range" : 2
  },
  9: {
    "id": "clarinet",
    "name" : "clarinet",
    "baseOctave" : 3,
    "baseNote": "D",
    "range" : 2
  },
  10: {
    "id": "harmonium",
    "name" : "harmonium",
    "baseOctave" : 3,
    "baseNote": "C",
    "range" : 3
  }, 
  11: {
    "id": "violin",
    "name" : "violin",
    "baseOctave" : 4,
    "baseNote": "A",
    "range" : 2
  }, 
  12: {
    "id": "flute",
    "name" : "flute",
    "baseOctave" : 3,
    "baseNote": "A",
    "range" : 2
  },
  13: {
    "id": "harp",
    "name" : "harp",
    "baseOctave" : 4,
    "baseNote": "D",
    "range" : 3
  }, 
  14: {
    "id": "xylophone",
    "name" : "xylophone",
    "baseOctave" : 4,
    "baseNote": "C",
    "range" : 3
  }, 
  15: {
    "id": "piano",
    "name" : "piano",
    "baseOctave" : 2,
    "baseNote": "C",
    "range" : 4
  }
};

export default instrumentList;
