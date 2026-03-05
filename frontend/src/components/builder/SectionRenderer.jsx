import { cn } from "@/lib/utils";

import { InlineEditableText } from "./InlineEditableText";
import { SelectableStyleWrapper } from "./SelectableStyleWrapper";


const ensureList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const defaultHeroStatLabels = ["Signal 1", "Signal 2", "Signal 3"];
const defaultBlogCardLabels = ["Story 1", "Story 2", "Story 3"];
const defaultContactFormFields = ["Name field", "Email field", "Project details"];

const createDefaultBlogDescriptions = (length) =>
  Array.from({ length }, () => "Editorial card ready for blog, resources, or launch notes.");

const getContrastColor = (hex) => {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return "#FFFFFF";
  }

  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 160 ? "#09090B" : "#FFFFFF";
};

const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value || "");

const hexToRgb = (hexColor) => {
  if (!isValidHexColor(hexColor)) {
    return null;
  }

  return {
    red: Number.parseInt(hexColor.slice(1, 3), 16),
    green: Number.parseInt(hexColor.slice(3, 5), 16),
    blue: Number.parseInt(hexColor.slice(5, 7), 16),
  };
};

const normalizeChannel = (channel) => {
  const ratio = channel / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
};

const getRelativeLuminance = (hexColor) => {
  const rgb = hexToRgb(hexColor);

  if (!rgb) {
    return null;
  }

  return (0.2126 * normalizeChannel(rgb.red))
    + (0.7152 * normalizeChannel(rgb.green))
    + (0.0722 * normalizeChannel(rgb.blue));
};

const getContrastRatio = (firstColor, secondColor) => {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  if (firstLuminance === null || secondLuminance === null) {
    return 0;
  }

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const ensureReadableTextColor = (backgroundColor, preferredColor) => {
  if (!isValidHexColor(backgroundColor)) {
    return preferredColor;
  }

  const preferred = isValidHexColor(preferredColor) ? preferredColor : "#F8FAFC";

  if (getContrastRatio(backgroundColor, preferred) >= 3.2) {
    return preferred;
  }

  const lightOption = "#F8FAFC";
  const darkOption = "#09090B";

  return getContrastRatio(backgroundColor, lightOption) >= getContrastRatio(backgroundColor, darkOption)
    ? lightOption
    : darkOption;
};

const splitFaqItem = (value = "") => {
  const [question = "", ...answerParts] = value.split(" — ");

  return {
    question,
    answer: answerParts.join(" — "),
  };
};

const buildFaqItem = (question, answer) => {
  if (!answer) {
    return question;
  }

  return `${question} — ${answer}`;
};

const buildTextControls = (defaultColor) => [
  { key: "color", label: "Text", defaultValue: defaultColor },
];

const buildSurfaceControls = (backgroundColor, color, borderColor) => [
  { key: "backgroundColor", label: "Fill", defaultValue: backgroundColor },
  { key: "color", label: "Text", defaultValue: color },
  { key: "borderColor", label: "Border", defaultValue: borderColor },
];

const withItemKey = (node, itemKey) => {
  if (!itemKey) {
    return node;
  }

  return (
    <span key={itemKey} className="contents">
      {node}
    </span>
  );
};


export const SectionRenderer = ({
  section,
  onSelectSection,
  onUpdateSectionContent,
  onUpdateSectionListItem,
  selectedStyleTarget,
  onSelectStyleTarget,
  showStyleHandles = false,
}) => {
  const content = section.content || {};
  const sectionBackground = section.styles?.background || "#0B1020";
  const sectionText = ensureReadableTextColor(sectionBackground, section.styles?.text || "#FAFAFA");
  const styles = {
    background: sectionBackground,
    accent: section.styles?.accent || "#6366F1",
    text: sectionText,
    align: section.styles?.align || "left",
    paddingY: Number(section.styles?.paddingY || 80),
    buttonStyle: section.styles?.buttonStyle || "solid",
  };
  const elementStyles = section.styles?.elementStyles || {};

  const alignClasses = styles.align === "center" ? "items-center text-center" : "items-start text-left";
  const surfaceStyle = {
    backgroundColor: styles.background,
    color: styles.text,
    paddingTop: `${Math.max(styles.paddingY, 32)}px`,
    paddingBottom: `${Math.max(styles.paddingY, 32)}px`,
  };
  const maxWidth = section.type === "header" || section.type === "footer" ? "max-w-6xl" : "max-w-5xl";

  const selectSection = () => onSelectSection?.(section.id);

  const updateField = (field, value) => {
    onUpdateSectionContent?.(section.id, field, value);
  };

  const updateListItem = (field, index, value, fallbackList = []) => {
    onUpdateSectionListItem?.(section.id, field, index, value, fallbackList);
  };

  const isStyleTargetSelected = (styleKey) => (
    selectedStyleTarget?.sectionId === section.id && selectedStyleTarget?.key === styleKey
  );

  const getElementStyle = (styleKey, baseStyle = {}) => {
    const mergedStyle = {
      ...baseStyle,
      ...(elementStyles[styleKey] || {}),
    };

    if (isValidHexColor(mergedStyle.backgroundColor)) {
      mergedStyle.color = ensureReadableTextColor(
        mergedStyle.backgroundColor,
        mergedStyle.color || styles.text
      );
    }

    return mergedStyle;
  };

  const selectStyleTarget = ({ key, label, controls }) => {
    selectSection();
    onSelectStyleTarget?.({
      sectionId: section.id,
      key,
      kind: "component",
      label,
      controls,
    });
  };

  const wrapStyleTarget = ({
    styleKey,
    label,
    controls,
    inline = false,
    wrapperClassName,
    selectionClassName,
    handleClassName,
    testId,
    children,
  }) => {
    if (!styleKey) {
      return children;
    }

    return (
      <SelectableStyleWrapper
        inline={inline}
        selected={isStyleTargetSelected(styleKey)}
        showHandle={showStyleHandles}
        onSelect={() => selectStyleTarget({ key: styleKey, label, controls })}
        wrapperClassName={wrapperClassName}
        selectionClassName={selectionClassName}
        handleClassName={handleClassName}
        label={label}
        testId={testId}
      >
        {children}
      </SelectableStyleWrapper>
    );
  };

  const renderStylableContainer = ({
    as: ElementTag = "div",
    styleKey,
    itemKey,
    label,
    controls,
    className,
    style,
    children,
    testId,
    wrapperClassName,
    handleClassName,
  }) => {
    const contentNode = (
      <ElementTag
        className={className}
        style={getElementStyle(styleKey, style)}
        data-testid={testId}
      >
        {children}
      </ElementTag>
    );

    const containerNode = wrapStyleTarget({
      styleKey,
      label,
      controls,
      wrapperClassName,
      handleClassName,
      testId: testId ? `${testId}-color-target` : undefined,
      children: contentNode,
    });

    return withItemKey(containerNode, itemKey);
  };

  const renderEditableField = ({
    as = "p",
    field,
    value,
    multiline = false,
    className,
    inputClassName,
    testId,
    placeholder,
    style,
    itemKey,
    styleTarget,
    inline = false,
    wrapperClassName,
    handleClassName,
  }) => {
    const styleKey = styleTarget?.key;
    const fieldNode = (
      <InlineEditableText
        key={itemKey}
        as={as}
        value={value || ""}
        onChange={(nextValue) => updateField(field, nextValue)}
        onStartEdit={selectSection}
        multiline={multiline}
        className={className}
        inputClassName={inputClassName}
        testId={testId}
        placeholder={placeholder}
        style={styleKey ? getElementStyle(styleKey, style) : style}
      />
    );

    if (!styleTarget) {
      return withItemKey(fieldNode, itemKey);
    }

    const styledNode = wrapStyleTarget({
      styleKey,
      label: styleTarget.label,
      controls: styleTarget.controls,
      inline,
      wrapperClassName,
      handleClassName,
      testId: testId ? `${testId}-color-target` : undefined,
      children: fieldNode,
    });

    return withItemKey(styledNode, itemKey);
  };

  const renderEditableListItem = ({
    as = "span",
    field,
    items,
    index,
    value,
    multiline = false,
    className,
    inputClassName,
    testId,
    placeholder,
    style,
    itemKey,
    styleTarget,
    inline = true,
    wrapperClassName,
    handleClassName,
  }) => {
    const styleKey = styleTarget?.key;
    const fieldNode = (
      <InlineEditableText
        key={itemKey}
        as={as}
        value={value || ""}
        onChange={(nextValue) => updateListItem(field, index, nextValue, items)}
        onStartEdit={selectSection}
        multiline={multiline}
        className={className}
        inputClassName={inputClassName}
        testId={testId}
        placeholder={placeholder}
        style={styleKey ? getElementStyle(styleKey, style) : style}
      />
    );

    if (!styleTarget) {
      return fieldNode;
    }

    return wrapStyleTarget({
      styleKey,
      label: styleTarget.label,
      controls: styleTarget.controls,
      inline,
      wrapperClassName,
      handleClassName,
      testId: testId ? `${testId}-color-target` : undefined,
      children: fieldNode,
    });
  };

  const renderButtonChip = (label, field, variant, testId) => {
    if (!label) {
      return null;
    }

    const isPrimary = variant === "primary";
    const appearance = (() => {
      if (isPrimary) {
        if (styles.buttonStyle === "outline") {
          return {
            className: "border bg-transparent",
            style: { borderColor: `${styles.accent}80`, color: styles.text },
          };
        }

        if (styles.buttonStyle === "ghost") {
          return {
            className: "border border-transparent bg-white/10",
            style: { color: styles.text },
          };
        }

        return {
          className: "border border-transparent",
          style: {
            backgroundColor: styles.accent,
            color: getContrastColor(styles.accent),
            boxShadow: `0 0 20px ${styles.accent}55`,
          },
        };
      }

      if (styles.buttonStyle === "solid") {
        return {
          className: "border border-white/10 bg-white/10",
          style: { color: styles.text },
        };
      }

      if (styles.buttonStyle === "ghost") {
        return {
          className: "border border-transparent bg-transparent",
          style: { color: styles.text },
        };
      }

      return {
        className: "border bg-transparent",
        style: { borderColor: `${styles.accent}80`, color: styles.text },
      };
    })();

    const buttonStyle = getElementStyle(field, appearance.style);
    const buttonControls = buildSurfaceControls(
      buttonStyle.backgroundColor || (isPrimary ? styles.accent : styles.background),
      buttonStyle.color || styles.text,
      buttonStyle.borderColor || (isPrimary ? styles.accent : styles.text)
    );

    const buttonNode = (
      <InlineEditableText
        as="span"
        value={label}
        onChange={(nextValue) => updateField(field, nextValue)}
        onStartEdit={selectSection}
        testId={testId}
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-200",
          appearance.className
        )}
        inputClassName="text-center"
        placeholder="Button label"
        style={buttonStyle}
      />
    );

    return wrapStyleTarget({
      styleKey: field,
      label: variant === "primary" ? "Primary button" : "Secondary button",
      controls: buttonControls,
      inline: true,
      handleClassName: "right-0 top-0 -translate-y-1/2 translate-x-1/4",
      testId: `${testId}-color-target`,
      children: buttonNode,
    });
  };

  const textStyleTarget = (key, label, defaultColor = styles.text) => ({
    key,
    label,
    controls: buildTextControls(defaultColor),
  });

  const surfaceStyleTarget = (key, label, backgroundColor, color, borderColor) => ({
    key,
    label,
    controls: buildSurfaceControls(backgroundColor, color, borderColor),
  });

  if (section.type === "header") {
    const navItems = ensureList(content.navItems);

    return (
      <section className="relative overflow-hidden rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 md:flex-row md:items-center md:justify-between">
          <div>
            {renderEditableField({
              as: "p",
              field: "brand",
              value: content.brand,
              className: "font-heading text-2xl font-semibold",
              testId: `section-${section.id}-brand`,
              placeholder: "Brand name",
              styleTarget: textStyleTarget("brand", "Header brand"),
              wrapperClassName: "w-fit",
            })}
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-start gap-3 md:justify-center">
            {navItems.map((item, index) =>
              renderEditableListItem({
                itemKey: `${section.id}-nav-item-${index}`,
                as: "span",
                field: "navItems",
                items: navItems,
                index,
                value: item,
                className: "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-inherit/80",
                inputClassName: "text-center",
                testId: `section-${section.id}-nav-item-${index}`,
                placeholder: "Nav item",
                styleTarget: surfaceStyleTarget(
                  `navItems.${index}`,
                  `Navigation item ${index + 1}`,
                  "#18181B",
                  styles.text,
                  styles.text
                ),
              })
            )}
          </div>

          {renderButtonChip(content.primaryCta, "primaryCta", "primary", `section-${section.id}-primary-cta`)}
        </div>
      </section>
    );
  }

  if (section.type === "hero") {
    const stats = ensureList(content.stats);
    const statLabels = stats.map(
      (_, index) => ensureList(content.statLabels)[index] || defaultHeroStatLabels[index] || `Signal ${index + 1}`
    );

    return (
      <section className="relative overflow-hidden rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className="pointer-events-none absolute -right-16 top-12 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: styles.accent }} />
        <div className={`mx-auto grid ${maxWidth} gap-10 px-6 md:grid-cols-[1.15fr_0.85fr]`}>
          <div className={`relative flex flex-col ${alignClasses} gap-5`}>
            {renderEditableField({
              as: "span",
              field: "eyebrow",
              value: content.eyebrow,
              className: "inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-inherit/70",
              testId: `section-${section.id}-eyebrow`,
              placeholder: "Eyebrow",
              styleTarget: surfaceStyleTarget("eyebrow", "Hero eyebrow", "#111827", styles.text, styles.text),
              inline: true,
            })}

            {renderEditableField({
              as: "h2",
              field: "title",
              value: content.title,
              multiline: true,
              className: "max-w-3xl font-heading text-4xl font-semibold leading-tight md:text-5xl",
              testId: `section-${section.id}-title`,
              placeholder: "Hero title",
              styleTarget: textStyleTarget("title", "Hero title"),
              wrapperClassName: "max-w-3xl",
            })}

            {renderEditableField({
              as: "p",
              field: "description",
              value: content.description,
              multiline: true,
              className: "max-w-2xl text-base leading-relaxed text-inherit/80 md:text-lg",
              testId: `section-${section.id}-description`,
              placeholder: "Hero description",
              styleTarget: textStyleTarget("description", "Hero description"),
              wrapperClassName: "max-w-2xl",
            })}

            <div className="flex flex-wrap gap-3">
              {renderButtonChip(content.primaryCta, "primaryCta", "primary", `section-${section.id}-primary-cta`)}
              {renderButtonChip(content.secondaryCta, "secondaryCta", "secondary", `section-${section.id}-secondary-cta`)}
            </div>
          </div>

          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            {stats.map((item, index) => (
              renderStylableContainer({
                itemKey: `${section.id}-stat-card-${index}`,
                styleKey: `statCard.${index}`,
                label: `Hero stat card ${index + 1}`,
                controls: buildSurfaceControls("#111827", styles.text, styles.accent),
                className: "rounded-[1.25rem] border border-white/10 bg-black/15 px-4 py-4",
                testId: `section-${section.id}-stat-${index}`,
                children: (
                  <>
                    {renderEditableListItem({
                      as: "span",
                      field: "statLabels",
                      items: statLabels,
                      index,
                      value: statLabels[index],
                      className: "text-[11px] font-bold uppercase tracking-[0.28em] text-inherit/55",
                      testId: `section-${section.id}-stat-label-${index}`,
                      placeholder: "Stat label",
                      styleTarget: textStyleTarget(`statLabels.${index}`, `Hero stat label ${index + 1}`),
                    })}

                    {renderEditableListItem({
                      as: "p",
                      field: "stats",
                      items: stats,
                      index,
                      value: item,
                      multiline: true,
                      className: "mt-2 text-lg font-semibold text-inherit",
                      testId: `section-${section.id}-stat-value-${index}`,
                      placeholder: "Stat value",
                      styleTarget: textStyleTarget(`stats.${index}`, `Hero stat value ${index + 1}`),
                    })}
                  </>
                ),
              })
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "logos") {
    const logos = ensureList(content.logos);

    return (
      <section className="rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className={`mx-auto flex ${maxWidth} flex-col ${alignClasses} gap-6 px-6`}>
          {renderEditableField({
            as: "p",
            field: "title",
            value: content.title,
            multiline: true,
            className: "text-lg font-semibold text-inherit/80",
            testId: `section-${section.id}-title`,
            placeholder: "Logos title",
            styleTarget: textStyleTarget("title", "Logos title"),
            wrapperClassName: "max-w-3xl",
          })}

          <div className="flex flex-wrap items-center justify-center gap-3 self-stretch">
            {logos.map((logo, index) =>
              renderEditableListItem({
                itemKey: `${section.id}-logo-${index}`,
                as: "span",
                field: "logos",
                items: logos,
                index,
                value: logo,
                className: "rounded-full border border-black/10 bg-black/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.26em] text-inherit/75",
                inputClassName: "text-center",
                testId: `section-${section.id}-logo-${index}`,
                placeholder: "Logo name",
                styleTarget: surfaceStyleTarget(
                  `logos.${index}`,
                  `Logo pill ${index + 1}`,
                  "#FFFFFF",
                  styles.text,
                  "#E5E7EB"
                ),
              })
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "features") {
    const items = ensureList(content.items);

    return (
      <section className="rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className={`mx-auto flex ${maxWidth} flex-col ${alignClasses} gap-6 px-6`}>
          {renderEditableField({
            as: "span",
            field: "eyebrow",
            value: content.eyebrow,
            className: "text-[11px] font-bold uppercase tracking-[0.3em] text-inherit/55",
            testId: `section-${section.id}-eyebrow`,
            placeholder: "Eyebrow",
            styleTarget: textStyleTarget("eyebrow", "Features eyebrow"),
            wrapperClassName: "w-fit",
          })}

          {renderEditableField({
            as: "h2",
            field: "title",
            value: content.title,
            multiline: true,
            className: "font-heading text-3xl font-semibold md:text-4xl",
            testId: `section-${section.id}-title`,
            placeholder: "Section title",
            styleTarget: textStyleTarget("title", "Features title"),
            wrapperClassName: "max-w-3xl",
          })}

          {renderEditableField({
            as: "p",
            field: "description",
            value: content.description,
            multiline: true,
            className: "max-w-3xl text-base leading-relaxed text-inherit/75",
            testId: `section-${section.id}-description`,
            placeholder: "Section description",
            styleTarget: textStyleTarget("description", "Features description"),
            wrapperClassName: "max-w-3xl",
          })}

          <div className="grid gap-4 md:grid-cols-3">
            {items.map((item, index) => (
              renderStylableContainer({
                itemKey: `${section.id}-feature-card-${index}`,
                styleKey: `featureCard.${index}`,
                label: `Feature card ${index + 1}`,
                controls: buildSurfaceControls("#FFFFFF", "#111827", "#E5E7EB"),
                className: "rounded-[1.6rem] border border-black/10 bg-white/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]",
                testId: `section-${section.id}-item-${index}`,
                children: (
                  <>
                    {renderStylableContainer({
                      styleKey: `featureAccent.${index}`,
                      label: `Feature accent ${index + 1}`,
                      controls: [{ key: "backgroundColor", label: "Fill", defaultValue: styles.accent }],
                      className: "h-10 w-10 rounded-2xl",
                      style: { backgroundColor: styles.accent },
                      testId: `section-${section.id}-item-accent-${index}`,
                    })}
                    {renderEditableListItem({
                      as: "p",
                      field: "items",
                      items,
                      index,
                      value: item,
                      multiline: true,
                      className: "mt-4 text-base font-semibold text-inherit",
                      testId: `section-${section.id}-item-text-${index}`,
                      placeholder: "Feature item",
                      styleTarget: textStyleTarget(`items.${index}`, `Feature text ${index + 1}`, "#111827"),
                    })}
                  </>
                ),
              })
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "testimonial") {
    const metrics = ensureList(content.metrics);

    return (
      <section className="relative overflow-hidden rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className="pointer-events-none absolute left-16 top-8 h-32 w-32 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: styles.accent }} />
        <div className={`mx-auto grid ${maxWidth} gap-8 px-6 md:grid-cols-[1.1fr_0.9fr]`}>
          <div className={`flex flex-col ${alignClasses} gap-5`}>
            {renderEditableField({
              as: "span",
              field: "eyebrow",
              value: content.eyebrow,
              className: "text-[11px] font-bold uppercase tracking-[0.3em] text-inherit/55",
              testId: `section-${section.id}-eyebrow`,
              placeholder: "Eyebrow",
              styleTarget: textStyleTarget("eyebrow", "Testimonial eyebrow"),
              wrapperClassName: "w-fit",
            })}

            <blockquote className="font-heading text-3xl font-semibold leading-tight md:text-4xl" data-testid={`section-${section.id}-quote-shell`}>
              <span aria-hidden="true">“</span>
              {renderEditableField({
                as: "span",
                field: "quote",
                value: content.quote,
                multiline: true,
                className: "inline text-inherit",
                inputClassName: "inline-block align-middle",
                testId: `section-${section.id}-quote`,
                placeholder: "Client quote",
                styleTarget: textStyleTarget("quote", "Testimonial quote"),
                inline: true,
              })}
              <span aria-hidden="true">”</span>
            </blockquote>

            <div>
              {renderEditableField({
                as: "p",
                field: "author",
                value: content.author,
                className: "text-lg font-semibold",
                testId: `section-${section.id}-author`,
                placeholder: "Author",
                styleTarget: textStyleTarget("author", "Author name"),
                wrapperClassName: "w-fit",
              })}
              {renderEditableField({
                as: "p",
                field: "role",
                value: content.role,
                className: "text-sm text-inherit/70",
                testId: `section-${section.id}-role`,
                placeholder: "Author role",
                styleTarget: textStyleTarget("role", "Author role"),
                wrapperClassName: "w-fit",
              })}
            </div>
          </div>

          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            {metrics.map((item, index) => (
              renderStylableContainer({
                itemKey: `${section.id}-metric-card-${index}`,
                styleKey: `metricsCard.${index}`,
                label: `Metric card ${index + 1}`,
                controls: buildSurfaceControls("#111827", styles.text, styles.accent),
                className: "rounded-[1.3rem] border border-white/10 bg-black/15 px-4 py-4",
                testId: `section-${section.id}-metric-${index}`,
                children: renderEditableListItem({
                  as: "p",
                  field: "metrics",
                  items: metrics,
                  index,
                  value: item,
                  className: "text-lg font-semibold text-inherit",
                  testId: `section-${section.id}-metric-value-${index}`,
                  placeholder: "Metric",
                  styleTarget: textStyleTarget(`metrics.${index}`, `Metric text ${index + 1}`),
                }),
              })
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "blog") {
    const items = ensureList(content.items);
    const cardLabels = items.map(
      (_, index) => ensureList(content.cardLabels)[index] || defaultBlogCardLabels[index] || `Story ${index + 1}`
    );
    const cardDescriptions = items.map(
      (_, index) =>
        ensureList(content.cardDescriptions)[index]
        || createDefaultBlogDescriptions(items.length)[index]
    );

    return (
      <section className="rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className={`mx-auto flex ${maxWidth} flex-col ${alignClasses} gap-6 px-6`}>
          {renderEditableField({
            as: "span",
            field: "eyebrow",
            value: content.eyebrow,
            className: "text-[11px] font-bold uppercase tracking-[0.3em] text-inherit/55",
            testId: `section-${section.id}-eyebrow`,
            placeholder: "Eyebrow",
            styleTarget: textStyleTarget("eyebrow", "Blog eyebrow"),
            wrapperClassName: "w-fit",
          })}

          {renderEditableField({
            as: "h2",
            field: "title",
            value: content.title,
            multiline: true,
            className: "font-heading text-3xl font-semibold md:text-4xl",
            testId: `section-${section.id}-title`,
            placeholder: "Blog section title",
            styleTarget: textStyleTarget("title", "Blog title"),
            wrapperClassName: "max-w-3xl",
          })}

          {renderEditableField({
            as: "p",
            field: "description",
            value: content.description,
            multiline: true,
            className: "max-w-3xl text-base leading-relaxed text-inherit/75",
            testId: `section-${section.id}-description`,
            placeholder: "Blog section description",
            styleTarget: textStyleTarget("description", "Blog description"),
            wrapperClassName: "max-w-3xl",
          })}

          <div className="grid gap-4 md:grid-cols-3">
            {items.map((item, index) => (
              renderStylableContainer({
                itemKey: `${section.id}-article-card-${index}`,
                as: "article",
                styleKey: `articleCard.${index}`,
                label: `Article card ${index + 1}`,
                controls: buildSurfaceControls("#FFFFFF", "#111827", "#E5E7EB"),
                className: "rounded-[1.6rem] border border-black/10 bg-zinc-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)]",
                testId: `section-${section.id}-article-${index}`,
                children: (
                  <>
                    {renderEditableListItem({
                      as: "span",
                      field: "cardLabels",
                      items: cardLabels,
                      index,
                      value: cardLabels[index],
                      className: "inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em]",
                      inputClassName: "text-center",
                      testId: `section-${section.id}-article-label-${index}`,
                      placeholder: "Card label",
                      style: { backgroundColor: `${styles.accent}18`, color: styles.accent },
                      styleTarget: surfaceStyleTarget(
                        `cardLabels.${index}`,
                        `Article badge ${index + 1}`,
                        styles.accent,
                        "#FFFFFF",
                        styles.accent
                      ),
                    })}

                    {renderEditableListItem({
                      as: "p",
                      field: "items",
                      items,
                      index,
                      value: item,
                      multiline: true,
                      className: "mt-4 text-lg font-semibold text-zinc-950",
                      testId: `section-${section.id}-article-title-${index}`,
                      placeholder: "Article title",
                      styleTarget: textStyleTarget(`items.${index}`, `Article title ${index + 1}`, "#111827"),
                    })}

                    {renderEditableListItem({
                      as: "p",
                      field: "cardDescriptions",
                      items: cardDescriptions,
                      index,
                      value: cardDescriptions[index],
                      multiline: true,
                      className: "mt-3 text-sm text-zinc-500",
                      testId: `section-${section.id}-article-description-${index}`,
                      placeholder: "Article description",
                      styleTarget: textStyleTarget(`cardDescriptions.${index}`, `Article description ${index + 1}`, "#6B7280"),
                    })}
                  </>
                ),
              })
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "cta") {
    const items = ensureList(content.items);

    return (
      <section className="relative overflow-hidden rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-30 blur-3xl" style={{ backgroundColor: styles.accent }} />
        <div className={`mx-auto flex ${maxWidth} flex-col ${alignClasses} gap-6 px-6`}>
          {renderEditableField({
            as: "span",
            field: "eyebrow",
            value: content.eyebrow,
            className: "text-[11px] font-bold uppercase tracking-[0.3em] text-inherit/55",
            testId: `section-${section.id}-eyebrow`,
            placeholder: "Eyebrow",
            styleTarget: textStyleTarget("eyebrow", "CTA eyebrow"),
            wrapperClassName: "w-fit",
          })}

          {renderEditableField({
            as: "h2",
            field: "title",
            value: content.title,
            multiline: true,
            className: "font-heading text-3xl font-semibold md:text-4xl",
            testId: `section-${section.id}-title`,
            placeholder: "CTA title",
            styleTarget: textStyleTarget("title", "CTA title"),
            wrapperClassName: "max-w-3xl",
          })}

          {renderEditableField({
            as: "p",
            field: "description",
            value: content.description,
            multiline: true,
            className: "max-w-3xl text-base leading-relaxed text-inherit/75",
            testId: `section-${section.id}-description`,
            placeholder: "CTA description",
            styleTarget: textStyleTarget("description", "CTA description"),
            wrapperClassName: "max-w-3xl",
          })}

          <div className="flex flex-wrap justify-center gap-3 self-stretch md:justify-start">
            {items.map((item, index) =>
              renderEditableListItem({
                itemKey: `${section.id}-cta-bullet-${index}`,
                as: "span",
                field: "items",
                items,
                index,
                value: item,
                className: "rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-inherit/85",
                inputClassName: "text-center",
                testId: `section-${section.id}-bullet-${index}`,
                placeholder: "Bullet item",
                styleTarget: surfaceStyleTarget(
                  `ctaBullet.${index}`,
                  `CTA bullet ${index + 1}`,
                  "#FFFFFF",
                  styles.text,
                  styles.text
                ),
              })
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {renderButtonChip(content.primaryCta, "primaryCta", "primary", `section-${section.id}-primary-cta`)}
            {renderButtonChip(content.secondaryCta, "secondaryCta", "secondary", `section-${section.id}-secondary-cta`)}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "contact") {
    const formFields = defaultContactFormFields.map(
      (defaultValue, index) => ensureList(content.formFields)[index] || defaultValue
    );

    return (
      <section className="rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className={`mx-auto grid ${maxWidth} gap-8 px-6 md:grid-cols-[1fr_0.9fr]`}>
          <div className={`flex flex-col ${alignClasses} gap-5`}>
            {renderEditableField({
              as: "span",
              field: "eyebrow",
              value: content.eyebrow,
              className: "text-[11px] font-bold uppercase tracking-[0.3em] text-inherit/55",
              testId: `section-${section.id}-eyebrow`,
              placeholder: "Eyebrow",
              styleTarget: textStyleTarget("eyebrow", "Contact eyebrow"),
              wrapperClassName: "w-fit",
            })}

            {renderEditableField({
              as: "h2",
              field: "title",
              value: content.title,
              multiline: true,
              className: "font-heading text-3xl font-semibold md:text-4xl",
              testId: `section-${section.id}-title`,
              placeholder: "Contact title",
              styleTarget: textStyleTarget("title", "Contact title"),
              wrapperClassName: "max-w-3xl",
            })}

            {renderEditableField({
              as: "p",
              field: "description",
              value: content.description,
              multiline: true,
              className: "max-w-3xl text-base leading-relaxed text-inherit/75",
              testId: `section-${section.id}-description`,
              placeholder: "Contact description",
              styleTarget: textStyleTarget("description", "Contact description"),
              wrapperClassName: "max-w-3xl",
            })}

            <div className="grid gap-3">
              {renderStylableContainer({
                styleKey: "emailCard",
                label: "Email card",
                controls: buildSurfaceControls("#FFFFFF", "#111827", "#E5E7EB"),
                className: "rounded-[1.25rem] border border-black/10 bg-white/70 px-4 py-3",
                testId: `section-${section.id}-email`,
                children: (
                  <>
                {renderEditableField({
                  as: "span",
                  field: "emailLabel",
                  value: content.emailLabel || "Email",
                  className: "text-[11px] font-bold uppercase tracking-[0.28em] text-inherit/55",
                  testId: `section-${section.id}-email-label`,
                  placeholder: "Email label",
                  styleTarget: textStyleTarget("emailLabel", "Email label", "#6B7280"),
                  wrapperClassName: "w-fit",
                })}
                {renderEditableField({
                  as: "p",
                  field: "email",
                  value: content.email,
                  className: "mt-2 text-base font-semibold text-inherit",
                  testId: `section-${section.id}-email-value`,
                  placeholder: "Email address",
                  styleTarget: textStyleTarget("email", "Email value", "#111827"),
                  wrapperClassName: "w-fit",
                })}
                  </>
                ),
              })}

              {renderStylableContainer({
                styleKey: "phoneCard",
                label: "Phone card",
                controls: buildSurfaceControls("#FFFFFF", "#111827", "#E5E7EB"),
                className: "rounded-[1.25rem] border border-black/10 bg-white/70 px-4 py-3",
                testId: `section-${section.id}-phone`,
                children: (
                  <>
                {renderEditableField({
                  as: "span",
                  field: "phoneLabel",
                  value: content.phoneLabel || "Phone",
                  className: "text-[11px] font-bold uppercase tracking-[0.28em] text-inherit/55",
                  testId: `section-${section.id}-phone-label`,
                  placeholder: "Phone label",
                  styleTarget: textStyleTarget("phoneLabel", "Phone label", "#6B7280"),
                  wrapperClassName: "w-fit",
                })}
                {renderEditableField({
                  as: "p",
                  field: "phone",
                  value: content.phone,
                  className: "mt-2 text-base font-semibold text-inherit",
                  testId: `section-${section.id}-phone-value`,
                  placeholder: "Phone number",
                  styleTarget: textStyleTarget("phone", "Phone value", "#111827"),
                  wrapperClassName: "w-fit",
                })}
                  </>
                ),
              })}

              {renderStylableContainer({
                styleKey: "addressCard",
                label: "Address card",
                controls: buildSurfaceControls("#FFFFFF", "#111827", "#E5E7EB"),
                className: "rounded-[1.25rem] border border-black/10 bg-white/70 px-4 py-3",
                testId: `section-${section.id}-address`,
                children: (
                  <>
                {renderEditableField({
                  as: "span",
                  field: "addressLabel",
                  value: content.addressLabel || "Address",
                  className: "text-[11px] font-bold uppercase tracking-[0.28em] text-inherit/55",
                  testId: `section-${section.id}-address-label`,
                  placeholder: "Address label",
                  styleTarget: textStyleTarget("addressLabel", "Address label", "#6B7280"),
                  wrapperClassName: "w-fit",
                })}
                {renderEditableField({
                  as: "p",
                  field: "address",
                  value: content.address,
                  multiline: true,
                  className: "mt-2 text-base font-semibold text-inherit",
                  testId: `section-${section.id}-address-value`,
                  placeholder: "Address",
                  styleTarget: textStyleTarget("address", "Address value", "#111827"),
                  wrapperClassName: "max-w-full",
                })}
                  </>
                ),
              })}
            </div>
          </div>

          {renderStylableContainer({
            styleKey: "contactFormPanel",
            label: "Contact form panel",
            controls: buildSurfaceControls("#FFFFFF", "#111827", "#E5E7EB"),
            className: "rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]",
            testId: `section-${section.id}-form-panel`,
            children: (
              <div className="grid gap-4">
              <div>
                {renderEditableField({
                  as: "span",
                  field: "formEyebrow",
                  value: content.formEyebrow || "Inquiry flow",
                  className: "text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500",
                  testId: `section-${section.id}-form-eyebrow`,
                  placeholder: "Form eyebrow",
                  styleTarget: textStyleTarget("formEyebrow", "Form eyebrow", "#6B7280"),
                  wrapperClassName: "w-fit",
                })}
                {renderEditableField({
                  as: "p",
                  field: "formTitle",
                  value: content.formTitle || "Ready for your contact form or booking widget.",
                  multiline: true,
                  className: "mt-2 text-xl font-semibold text-zinc-950",
                  testId: `section-${section.id}-form-title`,
                  placeholder: "Form title",
                  styleTarget: textStyleTarget("formTitle", "Form title", "#111827"),
                  wrapperClassName: "max-w-full",
                })}
              </div>

              {formFields.map((item, index) =>
                renderEditableListItem({
                itemKey: `${section.id}-form-field-${index}`,
                  as: "span",
                  field: "formFields",
                  items: formFields,
                  index,
                  value: item,
                  className: "rounded-[1.25rem] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500",
                  testId: `section-${section.id}-form-field-${index}`,
                  placeholder: "Form field",
                  styleTarget: surfaceStyleTarget(
                    `formFields.${index}`,
                    `Form field ${index + 1}`,
                    "#F4F4F5",
                    "#6B7280",
                    "#D4D4D8"
                  ),
                })
              )}

              {renderButtonChip(content.primaryCta, "primaryCta", "primary", `section-${section.id}-primary-cta`)}
              </div>
            ),
          })}
        </div>
      </section>
    );
  }

  if (section.type === "faq") {
    const faqItems = ensureList(content.items);

    return (
      <section className="rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className={`mx-auto flex ${maxWidth} flex-col ${alignClasses} gap-6 px-6`}>
          {renderEditableField({
            as: "span",
            field: "eyebrow",
            value: content.eyebrow,
            className: "text-[11px] font-bold uppercase tracking-[0.3em] text-inherit/55",
            testId: `section-${section.id}-eyebrow`,
            placeholder: "Eyebrow",
            styleTarget: textStyleTarget("eyebrow", "FAQ eyebrow"),
            wrapperClassName: "w-fit",
          })}

          {renderEditableField({
            as: "h2",
            field: "title",
            value: content.title,
            multiline: true,
            className: "font-heading text-3xl font-semibold md:text-4xl",
            testId: `section-${section.id}-title`,
            placeholder: "FAQ title",
            styleTarget: textStyleTarget("title", "FAQ title"),
            wrapperClassName: "max-w-3xl",
          })}

          <div className="grid gap-4">
            {faqItems.map((item, index) => {
              const faqValue = splitFaqItem(item);

              return (
                renderStylableContainer({
                  itemKey: `${section.id}-faq-card-${index}`,
                  styleKey: `faqCard.${index}`,
                  label: `FAQ card ${index + 1}`,
                  controls: buildSurfaceControls("#FFFFFF", "#111827", "#E5E7EB"),
                  className: "rounded-[1.6rem] border border-black/10 bg-white/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]",
                  testId: `section-${section.id}-faq-${index}`,
                  children: (
                    <>
                      {wrapStyleTarget({
                        styleKey: `faqQuestion.${index}`,
                        label: `FAQ question ${index + 1}`,
                        controls: buildTextControls("#111827"),
                        wrapperClassName: "max-w-full",
                        testId: `section-${section.id}-faq-question-${index}-color-target`,
                        children: (
                          <InlineEditableText
                            as="p"
                            value={faqValue.question}
                            onChange={(nextValue) => updateListItem("items", index, buildFaqItem(nextValue, faqValue.answer), faqItems)}
                            onStartEdit={selectSection}
                            multiline
                            className="text-lg font-semibold text-inherit"
                            testId={`section-${section.id}-faq-question-${index}`}
                            placeholder="Question"
                            style={getElementStyle(`faqQuestion.${index}`)}
                          />
                        ),
                      })}
                      {wrapStyleTarget({
                        styleKey: `faqAnswer.${index}`,
                        label: `FAQ answer ${index + 1}`,
                        controls: buildTextControls("#6B7280"),
                        wrapperClassName: "mt-2 max-w-full",
                        testId: `section-${section.id}-faq-answer-${index}-color-target`,
                        children: (
                          <InlineEditableText
                            as="p"
                            value={faqValue.answer}
                            onChange={(nextValue) => updateListItem("items", index, buildFaqItem(faqValue.question, nextValue), faqItems)}
                            onStartEdit={selectSection}
                            multiline
                            className="text-sm leading-relaxed text-inherit/70"
                            testId={`section-${section.id}-faq-answer-${index}`}
                            placeholder="Answer"
                            style={getElementStyle(`faqAnswer.${index}`)}
                          />
                        ),
                      })}
                    </>
                  ),
                })
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "footer") {
    const links = ensureList(content.links);

    return (
      <section className="rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div>
            {renderEditableField({
              as: "p",
              field: "brand",
              value: content.brand,
              className: "font-heading text-3xl font-semibold",
              testId: `section-${section.id}-brand`,
              placeholder: "Brand name",
              styleTarget: textStyleTarget("brand", "Footer brand"),
              wrapperClassName: "w-fit",
            })}

            {renderEditableField({
              as: "p",
              field: "description",
              value: content.description,
              multiline: true,
              className: "mt-3 max-w-xl text-base leading-relaxed text-inherit/70",
              testId: `section-${section.id}-description`,
              placeholder: "Footer description",
              styleTarget: textStyleTarget("description", "Footer description"),
              wrapperClassName: "max-w-xl",
            })}
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex flex-wrap gap-3 md:justify-end">
              {links.map((item, index) =>
                renderEditableListItem({
                itemKey: `${section.id}-footer-link-${index}`,
                  as: "span",
                  field: "links",
                  items: links,
                  index,
                  value: item,
                  className: "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-inherit/75",
                  inputClassName: "text-center",
                  testId: `section-${section.id}-link-${index}`,
                  placeholder: "Footer link",
                  styleTarget: surfaceStyleTarget(
                    `links.${index}`,
                    `Footer link ${index + 1}`,
                    "#111827",
                    styles.text,
                    styles.text
                  ),
                })
              )}
            </div>

            {renderEditableField({
              as: "p",
              field: "legal",
              value: content.legal,
              multiline: true,
              className: "text-sm text-inherit/55",
              testId: `section-${section.id}-legal`,
              placeholder: "Legal text",
              styleTarget: textStyleTarget("legal", "Legal text"),
              wrapperClassName: "max-w-full",
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem]" style={surfaceStyle} data-testid={`builder-section-render-${section.id}`}>
      <div className={`mx-auto flex ${maxWidth} flex-col ${alignClasses} gap-4 px-6`}>
        {renderEditableField({
          as: "h2",
          field: "title",
          value: content.title || section.name,
          multiline: true,
          className: "font-heading text-3xl font-semibold",
          testId: `section-${section.id}-title`,
          placeholder: "Section title",
          styleTarget: textStyleTarget("title", "Section title"),
          wrapperClassName: "max-w-3xl",
        })}

        {renderEditableField({
          as: "p",
          field: "description",
          value: content.description || section.description,
          multiline: true,
          className: "text-base leading-relaxed text-inherit/75",
          testId: `section-${section.id}-description`,
          placeholder: "Section description",
          styleTarget: textStyleTarget("description", "Section description"),
          wrapperClassName: "max-w-3xl",
        })}
      </div>
    </section>
  );
};