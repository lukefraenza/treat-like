// Chain report types
export interface ChainContinueReport<ChainContinueOutput> {
    ok: true;
    stop: false;
    value: ChainContinueOutput;
}

export interface ChainStopReport<ChainStopOutput> {
    ok: true;
    stop: true;
    value: ChainStopOutput;
}

export interface ChainErrorReport<ChainError> {
    ok: false;
    error: ChainError;
}

export type ChainReport<ChainContinueOutput, ChainStopOutput, ChainError> = ChainContinueReport<ChainContinueOutput> | ChainStopReport<ChainStopOutput> | ChainErrorReport<ChainError>;


// Step reports types
export interface StepContinueResult<StepContinueOutput> {
    ok: true;
    stop: false;
    value: StepContinueOutput;
}

export interface StepStopResult<StepStopOutput> {
    ok: true;
    stop: true;
    value: StepStopOutput;
}

export interface StepErrorResult {
    ok: false;
}

export type StepResult<StepContinueOutput, StepStopOutput> = StepContinueResult<StepContinueOutput> | StepStopResult<StepStopOutput> | StepErrorResult;


// Step type
export type Step<StepInput, StepContinueOutput, StepStopOutput> = (value: StepInput) => StepResult<StepContinueOutput, StepStopOutput>;

// Chain type
export interface Chain<ChainInput, ChainContinueOutput, ChainStopOutput = never, ChainError = never> {
    apply(value: ChainInput): ChainReport<ChainContinueOutput, ChainStopOutput, ChainError>;

    then<StepContinueOutput, StepStopOutput = never, StepError = never>(step: Step<ChainContinueOutput, StepContinueOutput, StepStopOutput>, error?: StepError): Chain<ChainInput, StepContinueOutput, ChainStopOutput | StepStopOutput, ChainError | StepError>;
}


// Helper types
export type Input<T> = T extends Chain<infer Input, any, any, any> ? Input : never;
export type Output<T> = T extends Chain<any, infer ContinueOutput, infer StopOutput, any> ? ContinueOutput | StopOutput : never;
