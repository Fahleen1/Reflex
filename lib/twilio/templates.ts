interface TemplateVars {
  business_name: string;
}

export function renderMessageTemplate(
  template: string,
  vars: TemplateVars,
): string {
  return template.replace(/\{business_name\}/g, vars.business_name);
}
