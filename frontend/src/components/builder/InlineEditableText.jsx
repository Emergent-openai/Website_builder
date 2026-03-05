import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";


const resizeTextarea = (node) => {
  if (!node || node.tagName !== "TEXTAREA") {
    return;
  }

  node.style.height = "0px";
  node.style.height = `${node.scrollHeight}px`;
};


export const InlineEditableText = ({
  as: ElementTag = "span",
  value,
  onChange,
  onStartEdit,
  multiline = false,
  className,
  inputClassName,
  testId,
  placeholder = "Type here",
  style,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!isEditing || !inputRef.current) {
      return;
    }

    const node = inputRef.current;
    node.focus();

    if (multiline) {
      resizeTextarea(node);
    }

    if (typeof node.setSelectionRange === "function") {
      node.setSelectionRange(0, node.value.length);
    } else if (typeof node.select === "function") {
      node.select();
    }
  }, [isEditing, multiline]);

  useEffect(() => {
    if (multiline) {
      resizeTextarea(inputRef.current);
    }
  }, [draft, multiline]);

  const beginEditing = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onStartEdit?.();
    setDraft(value ?? "");
    setIsEditing(true);
  };

  const finishEditing = () => {
    setIsEditing(false);
  };

  const revertEditing = () => {
    const originalValue = value ?? "";
    setDraft(originalValue);
    onChange(originalValue);
    setIsEditing(false);
  };

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setDraft(nextValue);
    onChange(nextValue);
  };

  if (isEditing) {
    const sharedEditorProps = {
      ref: inputRef,
      value: draft,
      onChange: handleChange,
      onBlur: finishEditing,
      onClick: (event) => event.stopPropagation(),
      onFocus: (event) => event.stopPropagation(),
      onMouseDown: (event) => event.stopPropagation(),
      onKeyDown: (event) => {
        event.stopPropagation();

        if (event.key === "Escape") {
          event.preventDefault();
          revertEditing();
          return;
        }

        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          finishEditing();
          event.currentTarget.blur();
        }
      },
      spellCheck: true,
      style,
      "data-inline-editor": "true",
      className: cn(
        multiline
          ? "w-full resize-none overflow-hidden rounded-md border border-primary/50 bg-white/15 px-2 py-1 text-inherit shadow-[0_0_0_1px_rgba(99,102,241,0.15)] outline-none ring-2 ring-primary/30 backdrop-blur-sm"
          : "w-auto min-w-[4ch] rounded-md border border-primary/50 bg-white/15 px-2 py-1 text-inherit shadow-[0_0_0_1px_rgba(99,102,241,0.15)] outline-none ring-2 ring-primary/30 backdrop-blur-sm",
        className,
        inputClassName
      ),
      "data-testid": testId,
    };

    return multiline ? (
      <textarea {...sharedEditorProps} rows={1} aria-multiline="true" />
    ) : (
      <input {...sharedEditorProps} type="text" size={Math.max(draft.length, 1)} />
    );
  }

  return (
    <ElementTag
      role="button"
      tabIndex={0}
      onClick={beginEditing}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          beginEditing(event);
        }
      }}
      style={style}
      data-inline-display="true"
      className={cn(
        "cursor-text rounded-md outline-none transition-colors duration-150 hover:outline hover:outline-1 hover:outline-primary/30 focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
        !value && "opacity-70"
      )}
      data-testid={testId}
    >
      {value || placeholder}
    </ElementTag>
  );
};