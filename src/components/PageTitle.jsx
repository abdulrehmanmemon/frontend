import { Breadcrumbs, BreadcrumbsItem } from "@/components/daisyui";

const PageTitle = ({ title, breadCrumbItems, centerItems }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">{title}</h3>
      {centerItems != null && centerItems}
      <>
        {breadCrumbItems && (
          <Breadcrumbs className="hidden p-0 sm:inline">
            <BreadcrumbsItem key={0}>Nexus</BreadcrumbsItem>
            {breadCrumbItems.map((breadCrumbItem, index) => {
              return (
                <BreadcrumbsItem key={index + 1} href={breadCrumbItem.path}>
                  {breadCrumbItem.label}
                </BreadcrumbsItem>
              );
            })}
          </Breadcrumbs>
        )}
      </>
    </div>
  );
};

export { PageTitle };
