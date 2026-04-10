import { useState } from "react";
import type { AppConfig, ProviderConfig } from "../../types/config";
import { CopyButton } from "../ui/CopyButton";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/PasswordInput";

interface ProvidersSectionProps {
    config: AppConfig;
    backend: "picoclaw" | "hermes";
    onChange: (path: string, value: unknown) => void;
}

type ProviderField = {
    key: keyof ProviderConfig;
    label: string;
    placeholder?: string;
    type: "text" | "password";
};

type ProviderMeta = {
    key: string;
    label: string;
    fields: ProviderField[];
};

const picoclawProviders: ProviderMeta[] = [
    {
        key: "openai",
        label: "OpenAI",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
            {
                key: "base_url",
                label: "Base URL",
                type: "text",
                placeholder: "Optional",
            },
        ],
    },
    {
        key: "anthropic",
        label: "Anthropic",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "google",
        label: "Google",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "groq",
        label: "Groq",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "mistral",
        label: "Mistral",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "cohere",
        label: "Cohere",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "deepseek",
        label: "DeepSeek",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "xai",
        label: "xAI",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "zai",
        label: "z.ai",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "custom",
        label: "Custom",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
            {
                key: "base_url",
                label: "Base URL",
                type: "text",
                placeholder: "Optional",
            },
            {
                key: "model",
                label: "Model",
                type: "text",
                placeholder: "Optional",
            },
        ],
    },
];

const hermesProviders: ProviderMeta[] = [
    {
        key: "openai",
        label: "OpenAI / Codex",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
            {
                key: "api_base",
                label: "Base URL",
                type: "text",
                placeholder: "Optional",
            },
        ],
    },
    {
        key: "anthropic",
        label: "Anthropic",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "google",
        label: "Google",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "groq",
        label: "Groq",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "deepseek",
        label: "DeepSeek",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "minimax",
        label: "MiniMax",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "minimax_cn",
        label: "MiniMax CN",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
        ],
    },
    {
        key: "custom",
        label: "Custom",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "Enter API key",
            },
            {
                key: "base_url",
                label: "Base URL",
                type: "text",
                placeholder: "Optional",
            },
            {
                key: "model",
                label: "Model",
                type: "text",
                placeholder: "Optional",
            },
        ],
    },
];

const ProviderCard = ({
    meta,
    config,
    onChange,
}: {
    meta: ProviderMeta;
    config: AppConfig;
    onChange: (path: string, value: unknown) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const providersData = (config.providers || {}) as unknown as Record<
        string,
        Record<string, string>
    >;
    const data = providersData[meta.key] || {};
    const hasKey = !!data["api_key"];

    const handleRemove = () => {
        if (confirm(`Remove ${meta.label} provider configuration?`)) {
            onChange(`providers.${meta.key}`, null);
        }
    };

    return (
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 motion-safe:transition-colors motion-safe:duration-150">
            <button
                type="button"
                className="w-full flex justify-between items-center text-left"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
            >
                <div className="flex items-center space-x-3">
                    <h3 className="font-medium capitalize">{meta.label}</h3>
                    {hasKey && (
                        <span
                            className="w-2 h-2 rounded-full bg-green-500"
                            title="Configured"
                        ></span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {hasKey && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove provider"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    )}
                    <span className="text-gray-500">
                        {expanded ? (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <title>Collapse</title>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <title>Expand</title>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        )}
                    </span>
                </div>
            </button>

            <div
                className={`grid mt-4 border-t border-gray-100 dark:border-gray-800 transition-[grid-template-rows] motion-safe:duration-200 ${
                    expanded ? "grid-rows-[1fr] pt-3" : "grid-rows-[0fr] pt-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="space-y-3">
                        {meta.fields.map((field) => {
                            const inputId = `provider-${meta.key}-${field.key}`;
                            const value = data[field.key] || "";

                            if (field.type === "password") {
                                return (
                                    <FormField
                                        key={field.key}
                                        id={inputId}
                                        label={field.label}
                                    >
                                        <div className="flex items-center gap-2">
                                            <PasswordInput
                                                value={value}
                                                onChange={(e) =>
                                                    onChange(
                                                        `providers.${meta.key}.${field.key}`,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={field.placeholder}
                                                className="flex-1"
                                            />
                                            <CopyButton text={value} />
                                        </div>
                                    </FormField>
                                );
                            }

                            return (
                                <FormField
                                    key={field.key}
                                    id={inputId}
                                    label={field.label}
                                >
                                    <Input
                                        type="text"
                                        value={value}
                                        onChange={(e) =>
                                            onChange(
                                                `providers.${meta.key}.${field.key}`,
                                                e.target.value,
                                            )
                                        }
                                        placeholder={field.placeholder}
                                    />
                                </FormField>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export function ProvidersSection({
    config,
    backend,
    onChange,
}: ProvidersSectionProps) {
    const list = backend === "picoclaw" ? picoclawProviders : hermesProviders;

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">Providers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((p) => (
                    <ProviderCard
                        key={p.key}
                        meta={p}
                        config={config}
                        onChange={onChange}
                    />
                ))}
            </div>
        </section>
    );
}
