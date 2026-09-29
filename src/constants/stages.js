export const STAGES = [
  { id: 'grade-7', label: 'أولى إعدادي' },
  { id: 'grade-8', label: 'تانية إعدادي' },
  { id: 'grade-9', label: 'تالتة إعدادي' },
  { id: 'grade-10', label: 'أولى ثانوي' },
  { id: 'baccalaureate-1', label: 'أولى بكالوريا' },
  { id: 'baccalaureate-2', label: 'تانية بكالوريا' },
  { id: 'grade-11', label: 'تانية ثانوي' },
  { id: 'grade-12', label: 'تالتة ثانوي' }
];

export const stageLabel = (stage) => STAGES.find((item) => item.id === stage)?.label || stage;
