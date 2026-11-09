export interface StudioAsset {
  src: string;
  width: number;
  height: number;
}

// Native screenshot crops: preserve their pixels and original aspect ratios.
export const portraits: Readonly<Record<string, StudioAsset>> = {
  Eva: { src: '/studio/photos/headshot-eva.png', width: 120, height: 96 },
  Esther: { src: '/studio/photos/headshot-esther.png', width: 128, height: 96 },
  Ana: { src: '/studio/photos/headshot-ana.png', width: 127, height: 96 },
  'Pep Comermà': { src: '/studio/photos/headshot-pep-comerma.png', width: 128, height: 96 },
  Raúl: { src: '/studio/photos/headshot-raul.png', width: 127, height: 96 },
  Andrea: { src: '/studio/photos/headshot-andrea.png', width: 122, height: 96 },
};

export const logos: Readonly<Record<string, StudioAsset>> = {
  'Generalitat de Catalunya': {
    src: '/studio/client-logos/generalitat-de-catalunya.png', width: 119, height: 35,
  },
  INCASÒL: { src: '/studio/client-logos/incasol.png', width: 114, height: 44 },
  'Ajuntament de Barcelona': {
    src: '/studio/client-logos/ajuntament-de-barcelona.png', width: 125, height: 47,
  },
  COPCISA: { src: '/studio/client-logos/copcisa.png', width: 121, height: 32 },
  COAC: { src: '/studio/client-logos/coac.png', width: 121, height: 45 },
};
