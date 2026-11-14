// Ambient type declarations for external target-project modules referenced by
// Stitch / Remotion / shadcn-ui skill examples and templates.

declare module 'remotion' {
  import type * as React from 'react';

  export const AbsoluteFill: React.FC<React.HTMLAttributes<HTMLDivElement> & { style?: React.CSSProperties }>;
  export const Sequence: React.FC<{
    from?: number;
    durationInFrames?: number;
    name?: string;
    children?: React.ReactNode;
  }>;
  export const Img: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { src: string }>;
  export const Composition: React.FC<{
    id: string;
    component: React.ComponentType<Record<string, never>> | React.FC;
    durationInFrames: number;
    fps: number;
    width: number;
    height: number;
  }>;
  export function staticFile(path: string): string;
  export function useCurrentFrame(): number;
  export function useVideoConfig(): {
    fps: number;
    width: number;
    height: number;
    durationInFrames: number;
    id: string;
  };
  export function spring(config: {
    frame: number;
    fps: number;
    from?: number;
    to?: number;
    durationInFrames?: number;
    config?: {
      damping?: number;
      mass?: number;
      stiffness?: number;
      overshootClamping?: boolean;
    };
  }): number;
  export function interpolate(
    input: number,
    inputRange: readonly number[],
    outputRange: readonly number[],
    options?: { extrapolateLeft?: string; extrapolateRight?: string },
  ): number;
}

declare module '@remotion/transitions' {
  import type * as React from 'react';

  export interface TransitionTiming {
    getDurationInFrames(options: { fps: number }): number;
    getProgress(options: { frame: number; fps: number }): number;
  }

  export const TransitionSeries: React.FC<{ children?: React.ReactNode }> & {
    Sequence: React.FC<{
      durationInFrames: number;
      children?: React.ReactNode;
    }>;
    Transition: React.FC<{
      presentation: unknown;
      timing: TransitionTiming | { durationInFrames: number };
    }>;
  };

  export function linearTiming(options: { durationInFrames: number }): TransitionTiming;
  export function springTiming(options?: {
    durationInFrames?: number;
    config?: Record<string, number>;
  }): TransitionTiming;
}

declare module '@remotion/transitions/fade' {
  export function fade(props?: { shouldFadeOutExitingScene?: boolean }): unknown;
}

declare module '@remotion/transitions/slide' {
  export function slide(props?: { direction?: 'from-left' | 'from-right' | 'from-top' | 'from-bottom' }): unknown;
}

declare module 'react-native' {
  import type * as React from 'react';

  export type StyleProp<T> = T | readonly StyleProp<T>[] | false | null | undefined;
  export type ViewStyle = Record<string, string | number | undefined>;
  export type TextStyle = Record<string, string | number | undefined>;
  export type ImageStyle = Record<string, string | number | undefined>;
  export type AccessibilityRole = 'none' | 'button' | 'link' | 'text' | 'image' | 'header';

  export interface BaseRNProps {
    children?: React.ReactNode;
    testID?: string;
    accessibilityRole?: AccessibilityRole;
    accessibilityLabel?: string;
  }

  export const View: React.FC<BaseRNProps & { style?: StyleProp<ViewStyle> }>;
  export const Text: React.FC<BaseRNProps & { style?: StyleProp<TextStyle>; numberOfLines?: number }>;
  export const Image: React.FC<
    BaseRNProps & {
      source: { uri: string } | number;
      style?: StyleProp<ImageStyle>;
    }
  >;
  export const Pressable: React.FC<
    BaseRNProps & {
      onPress?: () => void;
      style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
    }
  >;
  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select<T>(specifics: Record<string, T>): T;
  };
  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T;
  };
}

declare module 'lucide-react' {
  import type * as React from 'react';

  export type LucideIcon = React.FC<React.SVGProps<SVGSVGElement>>;
  export const ArrowUpDown: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const MoreHorizontal: LucideIcon;
}

declare module '@tanstack/react-table' {
  import type * as React from 'react';

  export interface SortingStateItem {
    id: string;
    desc: boolean;
  }
  export type SortingState = SortingStateItem[];

  export interface ColumnFilter {
    id: string;
    value: unknown;
  }
  export type ColumnFiltersState = ColumnFilter[];
  export type VisibilityState = Record<string, boolean>;
  export type RowSelectionState = Record<string, boolean>;

  export interface Column<TData> {
    id: string;
    columnDef: ColumnDef<TData>;
    getIsSorted(): false | 'asc' | 'desc';
    toggleSorting(desc?: boolean): void;
    getCanHide(): boolean;
    getIsVisible(): boolean;
    toggleVisibility(value?: boolean): void;
    getFilterValue(): unknown;
    setFilterValue(updater: unknown): void;
  }

  export interface Row<TData> {
    id: string;
    original: TData;
    getValue<TValue = string>(columnId: string): TValue;
    getIsSelected(): boolean;
    toggleSelected(value?: boolean): void;
    getVisibleCells(): Cell<TData>[];
  }

  export interface Cell<TData> {
    id: string;
    column: Column<TData>;
    row: Row<TData>;
    getContext(): { row: Row<TData>; column: Column<TData>; cell: Cell<TData> };
  }

  export interface Header<TData> {
    id: string;
    isPlaceholder: boolean;
    column: Column<TData>;
    getContext(): { header: Header<TData>; column: Column<TData> };
  }

  export interface HeaderGroup<TData> {
    id: string;
    headers: Header<TData>[];
  }

  export type ColumnDefTemplate<TContext> = string | ((context: TContext) => React.ReactNode);

  export interface ColumnDef<TData> {
    id?: string;
    accessorKey?: keyof TData & string;
    enableHiding?: boolean;
    enableSorting?: boolean;
    header?: ColumnDefTemplate<{ column: Column<TData> }>;
    cell?: ColumnDefTemplate<{ row: Row<TData> }>;
  }

  export interface Table<TData> {
    getColumn(columnId: string): Column<TData> | undefined;
    getAllColumns(): Column<TData>[];
    getHeaderGroups(): HeaderGroup<TData>[];
    getRowModel(): { rows: Row<TData>[] };
    getFilteredSelectedRowModel(): { rows: Row<TData>[] };
    getFilteredRowModel(): { rows: Row<TData>[] };
    previousPage(): void;
    nextPage(): void;
    getCanPreviousPage(): boolean;
    getCanNextPage(): boolean;
  }

  export function flexRender<TContext>(comp: ColumnDefTemplate<TContext> | undefined, props: TContext): React.ReactNode;
  export function getCoreRowModel(): () => unknown;
  export function getFilteredRowModel(): () => unknown;
  export function getPaginationRowModel(): () => unknown;
  export function getSortedRowModel(): () => unknown;
  export function useReactTable<TData>(options: {
    data: TData[];
    columns: ColumnDef<TData>[];
    onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
    onColumnFiltersChange?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    getCoreRowModel: () => unknown;
    getPaginationRowModel?: () => unknown;
    getSortedRowModel?: () => unknown;
    getFilteredRowModel?: () => unknown;
    onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<VisibilityState>>;
    onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    state?: {
      sorting?: SortingState;
      columnFilters?: ColumnFiltersState;
      columnVisibility?: VisibilityState;
      rowSelection?: RowSelectionState;
    };
  }): Table<TData>;
}

declare module 'react-hook-form' {
  import type * as React from 'react';

  export type FieldValues = Record<string, unknown>;

  export interface ControllerRenderProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends keyof TFieldValues = keyof TFieldValues,
  > {
    value: TFieldValues[TName];
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
    name: TName;
    ref: React.Ref<unknown>;
  }

  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    control: unknown;
    handleSubmit: (
      onValid: (data: TFieldValues) => void | Promise<void>,
    ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    reset: (values?: Partial<TFieldValues>) => void;
    watch: () => TFieldValues;
  }

  export function useForm<TFieldValues extends FieldValues = FieldValues>(props?: {
    resolver?: unknown;
    defaultValues?: Partial<TFieldValues>;
  }): UseFormReturn<TFieldValues>;
}

declare module '@hookform/resolvers/zod' {
  export function zodResolver(schema: unknown): unknown;
}

declare module '@/components/ui/*' {
  import type * as React from 'react';

  type AnyUiComponent = React.FC<Record<string, unknown> & { children?: React.ReactNode }>;

  export const Button: AnyUiComponent;
  export const Card: AnyUiComponent;
  export const CardContent: AnyUiComponent;
  export const CardDescription: AnyUiComponent;
  export const CardFooter: AnyUiComponent;
  export const CardHeader: AnyUiComponent;
  export const CardTitle: AnyUiComponent;
  export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>>;
  export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
  export const Tabs: AnyUiComponent;
  export const TabsContent: AnyUiComponent;
  export const TabsList: AnyUiComponent;
  export const TabsTrigger: AnyUiComponent;
  export const Textarea: AnyUiComponent;
  export const Form: AnyUiComponent;
  export const FormControl: AnyUiComponent;
  export const FormDescription: AnyUiComponent;
  export const FormField: React.FC<{
    control: unknown;
    name: string;
    render: (props: {
      field: Record<string, string | number | boolean | ((...args: unknown[]) => void)>;
    }) => React.ReactNode;
  }>;
  export const FormItem: AnyUiComponent;
  export const FormLabel: AnyUiComponent;
  export const FormMessage: AnyUiComponent;
  export const Select: AnyUiComponent;
  export const SelectContent: AnyUiComponent;
  export const SelectItem: AnyUiComponent;
  export const SelectTrigger: AnyUiComponent;
  export const SelectValue: AnyUiComponent;
  export const DropdownMenu: AnyUiComponent;
  export const DropdownMenuCheckboxItem: React.FC<
    Record<string, unknown> & {
      children?: React.ReactNode;
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
    }
  >;
  export const DropdownMenuContent: AnyUiComponent;
  export const DropdownMenuItem: AnyUiComponent;
  export const DropdownMenuLabel: AnyUiComponent;
  export const DropdownMenuSeparator: AnyUiComponent;
  export const DropdownMenuTrigger: AnyUiComponent;
  export const Table: AnyUiComponent;
  export const TableBody: AnyUiComponent;
  export const TableCell: AnyUiComponent;
  export const TableHead: AnyUiComponent;
  export const TableHeader: AnyUiComponent;
  export const TableRow: AnyUiComponent;

  export function toast(options: { title?: string; description?: React.ReactNode; variant?: string }): void;
}
