export type WaterFeature = {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  min?: number;
  max?: number;
  description: string;
};

export const waterFeatures: WaterFeature[] = [
  {
    key: "ph",
    label: "pH Level",
    unit: "pH",
    placeholder: "7.1",
    min: 0,
    max: 14,
    description: "Acidity or alkalinity level of the water sample."
  },
  {
    key: "Hardness",
    label: "Hardness",
    unit: "mg/L",
    placeholder: "205",
    min: 0,
    description: "Mineral hardness, commonly linked with calcium and magnesium content."
  },
  {
    key: "Solids",
    label: "Total Dissolved Solids",
    unit: "ppm",
    placeholder: "21000",
    min: 0,
    description: "Overall dissolved solid material in the water sample."
  },
  {
    key: "Chloramines",
    label: "Chloramines",
    unit: "ppm",
    placeholder: "7.2",
    min: 0,
    description: "Chemical disinfectant level in the water profile."
  },
  {
    key: "Sulfate",
    label: "Sulfate",
    unit: "mg/L",
    placeholder: "330",
    min: 0,
    description: "Sulfate concentration from the laboratory reading."
  },
  {
    key: "Conductivity",
    label: "Conductivity",
    unit: "μS/cm",
    placeholder: "420",
    min: 0,
    description: "Electrical conductivity indicating dissolved ionic content."
  },
  {
    key: "Organic_carbon",
    label: "Organic Carbon",
    unit: "ppm",
    placeholder: "14.5",
    min: 0,
    description: "Organic carbon level present in the water sample."
  },
  {
    key: "Trihalomethanes",
    label: "Trihalomethanes",
    unit: "μg/L",
    placeholder: "66",
    min: 0,
    description: "Trihalomethanes level from the water-quality record."
  },
  {
    key: "Turbidity",
    label: "Turbidity",
    unit: "NTU",
    placeholder: "3.8",
    min: 0,
    description: "Cloudiness or suspended particle measure."
  }
];

export const sampleWaterInput: Record<string, number> = {
  ph: 7.1,
  Hardness: 205,
  Solids: 21000,
  Chloramines: 7.2,
  Sulfate: 330,
  Conductivity: 420,
  Organic_carbon: 14.5,
  Trihalomethanes: 66,
  Turbidity: 3.8
};
