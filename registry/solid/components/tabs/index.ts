export type {
    TabsProps,
    TabsListProps,
    TabsTriggerProps,
    TabsContentProps,
    TabsVariant,
} from "./tabs";

export { useTabs } from "./tabs";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { Tabs, TabsList, TabsTrigger, TabsContent };

export default Object.assign(Tabs, {
    List: TabsList,
    Trigger: TabsTrigger,
    Content: TabsContent,
}) satisfies typeof Tabs & {
    List: typeof TabsList;
    Trigger: typeof TabsTrigger;
    Content: typeof TabsContent;
};
