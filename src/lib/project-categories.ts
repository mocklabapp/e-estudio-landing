import { projectCategoryIds, projectCategoryLabels, type ProjectCategoryId } from '../data/project-categories.ts';

export { projectCategoryIds, type ProjectCategoryId } from '../data/project-categories.ts';

export interface ProjectCategoryOption {
  value: ProjectCategoryId;
  label: string;
}

type OptionalString = string | null | undefined;

function labelsFor(locale: OptionalString) {
  return Object.entries(projectCategoryLabels).find(([language]) => language === locale)?.[1] ?? null;
}

/** Exact identifiers and locales only; unknown values never fall back to Spanish. */
export function getProjectCategoryLabel(value: OptionalString, locale: OptionalString): string | null {
  const id = projectCategoryIds.find((candidate) => candidate === value);
  const labels = labelsFor(locale);
  return id && labels ? labels[id] : null;
}

/** Fresh options in catalog order; use value (not label) when storing or filtering. */
export function getProjectCategoryOptions(locale: OptionalString): ProjectCategoryOption[] | null {
  const labels = labelsFor(locale);
  return labels ? projectCategoryIds.map((value) => ({ value, label: labels[value] })) : null;
}
