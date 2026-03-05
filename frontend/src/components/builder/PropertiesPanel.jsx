import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";


const scalarFieldConfig = [
  { key: "brand", label: "Brand" },
  { key: "eyebrow", label: "Eyebrow" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description", multiline: true },
  { key: "quote", label: "Quote", multiline: true },
  { key: "author", label: "Author" },
  { key: "role", label: "Role" },
  { key: "formEyebrow", label: "Form eyebrow" },
  { key: "formTitle", label: "Form title", multiline: true },
  { key: "emailLabel", label: "Email label" },
  { key: "phoneLabel", label: "Phone label" },
  { key: "addressLabel", label: "Address label" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address", multiline: true },
  { key: "primaryCta", label: "Primary button" },
  { key: "secondaryCta", label: "Secondary button" },
  { key: "legal", label: "Legal text", multiline: true },
];

const listFieldConfig = [
  { key: "navItems", label: "Navigation items" },
  { key: "statLabels", label: "Stat labels" },
  { key: "stats", label: "Stats" },
  { key: "logos", label: "Logos" },
  { key: "items", label: "List items" },
  { key: "cardLabels", label: "Card labels" },
  { key: "cardDescriptions", label: "Card descriptions" },
  { key: "formFields", label: "Form fields" },
  { key: "links", label: "Footer links" },
  { key: "metrics", label: "Metrics" },
];


const normalizeColor = (value, fallback) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(value || "")) {
    return value;
  }

  return fallback;
};


const FieldLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500">
    {children}
  </label>
);


const ColorField = ({ label, value, fallback, testIdPrefix, onChange }) => (
  <div className="grid gap-2">
    <FieldLabel htmlFor={`${testIdPrefix}-text`}>{label}</FieldLabel>
    <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
      <Input
        id={`${testIdPrefix}-picker`}
        type="color"
        value={normalizeColor(value, fallback)}
        onChange={(event) => onChange(event.target.value)}
        className="premium-input h-12 rounded-2xl border-white/10 bg-white/5 p-1"
        data-testid={`${testIdPrefix}-picker`}
      />
      <Input
        id={`${testIdPrefix}-text`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="premium-input h-12 rounded-2xl border-white/10 bg-white/5 font-mono-ui text-sm text-white"
        data-testid={`${testIdPrefix}-text`}
      />
    </div>
  </div>
);


export const PropertiesPanel = ({
  activePage,
  selectedSection,
  onClearSelection,
  onUpdatePageField,
  onUpdateSectionContent,
  onUpdateSectionList,
  onUpdateSectionStyle,
}) => {
  if (!activePage) {
    return null;
  }

  const contentValues = selectedSection?.content || {};
  const styleValues = selectedSection?.styles || {};
  const visibleScalarFields = scalarFieldConfig.filter((field) =>
    Object.prototype.hasOwnProperty.call(contentValues, field.key)
  );
  const visibleListFields = listFieldConfig.filter((field) =>
    Object.prototype.hasOwnProperty.call(contentValues, field.key)
  );

  return (
    <aside
      className="panel-shell flex min-h-[calc(100vh-11.5rem)] flex-col overflow-hidden rounded-[34px] p-6 xl:h-[calc(100vh-2.5rem)] xl:min-h-[calc(100vh-2.5rem)]"
      data-testid="properties-panel"
    >
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-zinc-500" data-testid="properties-panel-label">
              {selectedSection ? "Selected section" : "Page settings"}
            </p>
            <h2 className="mt-3 font-heading text-[2rem] font-semibold tracking-[-0.04em] text-white" data-testid="properties-panel-title">
              {selectedSection ? selectedSection.name : activePage.name}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400" data-testid="properties-panel-description">
              {selectedSection
                ? "Click any text on the canvas to edit directly, or use this panel for precise changes."
                : "Control the page title, slug, and basic metadata. Click canvas text to edit sections inline."}
            </p>
          </div>

          {selectedSection ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onClearSelection}
              className="button-premium-secondary rounded-full px-4 text-white"
              data-testid="clear-section-selection-button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Page
            </Button>
          ) : null}
        </div>
      </div>

      {selectedSection ? (
        <Tabs defaultValue="content" className="mt-5 flex min-h-0 flex-1 flex-col">
          <TabsList className="control-surface grid h-auto w-full grid-cols-2 rounded-[1.25rem] p-1.5">
            <TabsTrigger value="content" className="rounded-full text-zinc-300 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-[0_12px_24px_rgba(15,23,42,0.14)]" data-testid="properties-content-tab">
              Content
            </TabsTrigger>
            <TabsTrigger value="style" className="rounded-full text-zinc-300 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-[0_12px_24px_rgba(15,23,42,0.14)]" data-testid="properties-style-tab">
              Style
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4 min-h-0 flex-1">
            <div className="flex h-full min-h-0 flex-col">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-5 pb-6">
                  {visibleScalarFields.map((field) => {
                    const inputId = `section-field-${field.key}`;
                    const value = contentValues[field.key] || "";

                    return (
                      <div key={field.key}>
                        <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
                        {field.multiline ? (
                          <Textarea
                            id={inputId}
                            value={value}
                            onChange={(event) => onUpdateSectionContent(field.key, event.target.value)}
                            className="premium-input min-h-[110px] rounded-[1.6rem] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                            data-testid={`section-content-input-${field.key}`}
                          />
                        ) : (
                          <Input
                            id={inputId}
                            value={value}
                            onChange={(event) => onUpdateSectionContent(field.key, event.target.value)}
                            className="premium-input h-12 rounded-[1.6rem] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                            data-testid={`section-content-input-${field.key}`}
                          />
                        )}
                      </div>
                    );
                  })}

                  {visibleListFields.map((field) => (
                    <div key={field.key}>
                      <FieldLabel htmlFor={`section-list-${field.key}`}>{field.label}</FieldLabel>
                      <Textarea
                        id={`section-list-${field.key}`}
                        value={(contentValues[field.key] || []).join("\n")}
                        onChange={(event) =>
                          onUpdateSectionList(
                            field.key,
                            event.target.value
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean)
                          )
                        }
                        className="premium-input min-h-[140px] rounded-[1.6rem] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                        data-testid={`section-list-input-${field.key}`}
                      />
                    </div>
                  ))}

                  {!visibleScalarFields.length && !visibleListFields.length ? (
                    <div className="premium-subpanel rounded-[1.8rem] border-dashed px-5 py-8 text-center" data-testid="properties-empty-content-state">
                      <p className="font-heading text-lg text-white">This section is using its visual preset.</p>
                      <p className="mt-2 text-sm text-zinc-400">Select another section to edit text content.</p>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="style" className="mt-4 min-h-0 flex-1">
            <div className="flex h-full min-h-0 flex-col">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-5 pb-6">
                  <ColorField
                    label="Background"
                    value={styleValues.background || "#0B1020"}
                    fallback="#0B1020"
                    testIdPrefix="section-style-background"
                    onChange={(value) => onUpdateSectionStyle("background", value)}
                  />

                  <ColorField
                    label="Accent"
                    value={styleValues.accent || "#6366F1"}
                    fallback="#6366F1"
                    testIdPrefix="section-style-accent"
                    onChange={(value) => onUpdateSectionStyle("accent", value)}
                  />

                  <ColorField
                    label="Text"
                    value={styleValues.text || "#FAFAFA"}
                    fallback="#FAFAFA"
                    testIdPrefix="section-style-text"
                    onChange={(value) => onUpdateSectionStyle("text", value)}
                  />

                  <div>
                    <FieldLabel htmlFor="section-align-trigger">Alignment</FieldLabel>
                    <Select value={styleValues.align || "left"} onValueChange={(value) => onUpdateSectionStyle("align", value)}>
                      <SelectTrigger
                        id="section-align-trigger"
                        className="premium-input h-12 rounded-[1.6rem] border-white/10 bg-white/5 text-white"
                        data-testid="section-align-select"
                      >
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left aligned</SelectItem>
                        <SelectItem value="center">Centered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel htmlFor="section-button-style-trigger">Button style</FieldLabel>
                    <Select value={styleValues.buttonStyle || "solid"} onValueChange={(value) => onUpdateSectionStyle("buttonStyle", value)}>
                      <SelectTrigger
                        id="section-button-style-trigger"
                        className="premium-input h-12 rounded-[1.6rem] border-white/10 bg-white/5 text-white"
                        data-testid="section-button-style-select"
                      >
                        <SelectValue placeholder="Select button style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="section-spacing-slider">Vertical spacing</FieldLabel>
                      <span className="font-mono-ui text-sm text-zinc-300" data-testid="section-spacing-value">
                        {Number(styleValues.paddingY || 80)}px
                      </span>
                    </div>
                    <Slider
                      id="section-spacing-slider"
                      value={[Number(styleValues.paddingY || 80)]}
                      min={32}
                      max={160}
                      step={8}
                      onValueChange={(value) => onUpdateSectionStyle("paddingY", value[0])}
                      data-testid="section-spacing-slider"
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-5 pb-6">
              <div>
                <FieldLabel htmlFor="page-name-input">Page name</FieldLabel>
                <Input
                  id="page-name-input"
                  value={activePage.name}
                  onChange={(event) => onUpdatePageField("name", event.target.value)}
                  className="premium-input h-12 rounded-[1.6rem] border-white/10 bg-white/5 text-white"
                  data-testid="page-name-input"
                />
              </div>

              <div>
                <FieldLabel htmlFor="page-slug-input">Page slug</FieldLabel>
                <Input
                  id="page-slug-input"
                  value={activePage.slug}
                  onChange={(event) => onUpdatePageField("slug", event.target.value)}
                  className="premium-input h-12 rounded-[1.6rem] border-white/10 bg-white/5 text-white"
                  data-testid="page-slug-input"
                />
              </div>

              <div>
                <FieldLabel htmlFor="page-seo-title-input">SEO title</FieldLabel>
                <Input
                  id="page-seo-title-input"
                  value={activePage.seo_title}
                  onChange={(event) => onUpdatePageField("seo_title", event.target.value)}
                  className="premium-input h-12 rounded-[1.6rem] border-white/10 bg-white/5 text-white"
                  data-testid="page-seo-title-input"
                />
              </div>

              <div>
                <FieldLabel htmlFor="page-seo-description-input">SEO description</FieldLabel>
                <Textarea
                  id="page-seo-description-input"
                  value={activePage.seo_description}
                  onChange={(event) => onUpdatePageField("seo_description", event.target.value)}
                  className="premium-input min-h-[120px] rounded-[1.6rem] border-white/10 bg-white/5 text-white"
                  data-testid="page-seo-description-input"
                />
              </div>

              <div className="premium-subpanel rounded-[1.8rem] p-5" data-testid="page-settings-summary">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">Page summary</p>
                <p className="mt-3 font-heading text-2xl font-semibold text-white" data-testid="page-settings-summary-name">
                  {activePage.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="premium-pill rounded-full px-4 py-2 text-sm text-zinc-200" data-testid="page-settings-summary-slug">
                    /{activePage.slug}
                  </span>
                  <span className="premium-pill rounded-full px-4 py-2 text-sm text-zinc-200" data-testid="page-settings-summary-sections">
                    {activePage.sections.length} sections
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400" data-testid="page-settings-summary-note">
                  Select a section on the canvas to unlock detailed content and style editing.
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </aside>
  );
};