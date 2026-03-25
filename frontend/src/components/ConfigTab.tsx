import { useState } from "react";
import { useConfigQuery, useSaveConfig } from "../hooks/useConfig";
import { useBackendQuery } from "../hooks/useBackend";
import type { AppConfig } from "../types/config";

import { ProvidersSection } from "./config/ProvidersSection";
import { ChannelsSection } from "./config/ChannelsSection";
import { HermesOptions, type ExtendedAppConfig } from "./config/HermesOptions";
import { AgentDefaults } from "./config/AgentDefaults";
import { WebSearch } from "./config/WebSearch";
import { PicoClawMcp } from "./config/PicoClawMcp";
import { HermesMcp } from "./config/HermesMcp";
import { ExecTool } from "./config/ExecTool";
import { Cron } from "./config/Cron";
import { Skills } from "./config/Skills";
import { SystemSettings } from "./config/SystemSettings";
import { SaveBar } from "./config/SaveBar";

export function ConfigTab() {
    const { data: configData, isLoading: isLoadingConfig } = useConfigQuery();
    const { data: backendData, isLoading: isLoadingBackend } =
        useBackendQuery();
    const { mutate: saveConfig, isPending: isSaving } = useSaveConfig();

    const [localConfig, setLocalConfig] = useState<AppConfig | null>(null);
    const [lastLoadedConfigString, setLastLoadedConfigString] = useState<
        string | null
    >(null);

    if (configData) {
        const configString = JSON.stringify(configData);
        if (configString !== lastLoadedConfigString) {
            setLastLoadedConfigString(configString);
            setLocalConfig(JSON.parse(configString));
        }
    }

    if (isLoadingConfig || isLoadingBackend || !localConfig || !backendData) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-gray-500 dark:text-gray-400">
                    Loading configuration...
                </div>
            </div>
        );
    }

    const backend = backendData.backend;

    const handleChange = (path: string, value: unknown) => {
        setLocalConfig((prev) => {
            if (!prev) return prev;

            const newConfig = { ...prev };
            const keys = path.split(".");
            const lastKey = keys.pop();
            if (!lastKey) return prev;

            let current: Record<string, unknown> =
                newConfig as unknown as Record<string, unknown>;

            for (const key of keys) {
                current[key] = {
                    ...((current[key] as Record<string, unknown>) || {}),
                };
                current = current[key] as Record<string, unknown>;
            }

            current[lastKey] = value;
            return newConfig as AppConfig;
        });
    };

    const handleSave = (restartAfterSave: boolean) => {
        if (!localConfig) return;
        saveConfig({
            ...localConfig,
            _restartGateway: restartAfterSave,
        });
    };

    return (
        <div className="relative max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 pb-32">
            <ProvidersSection
                config={localConfig}
                backend={backend}
                onChange={handleChange}
            />

            {backend === "hermes" && (
                <HermesOptions
                    config={localConfig as ExtendedAppConfig}
                    backend={backend}
                    onChange={handleChange}
                />
            )}

            <ChannelsSection
                config={localConfig}
                backend={backend}
                onChange={(newConfig) => setLocalConfig(newConfig)}
            />

            <AgentDefaults
                config={localConfig}
                backend={backend}
                onChange={handleChange}
            />

            <WebSearch
                config={localConfig}
                backend={backend}
                onChange={handleChange}
            />

            <section className="mb-8">
                {backend === "picoclaw" ? (
                    <PicoClawMcp
                        enabled={localConfig.tools?.mcp?.enabled ?? false}
                        onEnabledChange={(enabled) =>
                            handleChange("tools.mcp.enabled", enabled)
                        }
                        servers={localConfig.tools?.mcp?.servers || {}}
                        onServersChange={(servers) =>
                            handleChange("tools.mcp.servers", servers)
                        }
                    />
                ) : (
                    <>
                        <h2 className="text-lg font-semibold mb-3">
                            MCP Servers
                        </h2>
                        <HermesMcp
                            servers={localConfig.hermes?.mcp_servers || []}
                            onServersChange={(servers) =>
                                handleChange("hermes.mcp_servers", servers)
                            }
                        />{" "}
                    </>
                )}
            </section>

            {backend === "picoclaw" && (
                <ExecTool
                    config={localConfig}
                    backend={backend}
                    onChange={handleChange}
                />
            )}

            <Cron
                config={localConfig}
                backend={backend}
                onChange={handleChange}
            />

            <Skills
                config={localConfig}
                backend={backend}
                onChange={handleChange}
            />

            <SystemSettings
                config={localConfig}
                backend={backend}
                onChange={handleChange}
            />

            <SaveBar
                config={localConfig}
                onSave={handleSave}
                saving={isSaving}
            />
        </div>
    );
}
