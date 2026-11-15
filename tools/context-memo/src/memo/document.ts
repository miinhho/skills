import { z } from 'zod';

const text = z.string().regex(/\S/, 'Must not be blank');
const texts = z.array(text);

export const idSchema = z
  .string()
  .regex(
    /^[a-z0-9][a-z0-9_-]{0,79}(?![\s\S])/,
    'Use 1–80 lowercase letters, digits, underscores or hyphens; start with a letter or digit',
  );
export const revisionSchema = z
  .string()
  .regex(/^[0-9a-f]{64}(?![\s\S])/, 'Expected a SHA-256 revision');

const idListSchema = z.array(idSchema);

const requirementFields = {
  id: idSchema,
  text,
};
const requirementSchema = z
  .discriminatedUnion('status', [
    z.strictObject({
      ...requirementFields,
      status: z.enum(['open', 'needs-review']),
      evidence: texts.readonly(),
    }),
    z.strictObject({
      ...requirementFields,
      status: z.enum(['met', 'withdrawn']),
      evidence: texts
        .min(1, 'Met requirements need proof; withdrawals need the user decision')
        .readonly(),
    }),
  ])
  .readonly();

const phaseFields = {
  id: idSchema,
  goal: text,
  requirements: idListSchema.min(1).readonly(),
  dependsOn: idListSchema.readonly(),
  doneWhen: texts.min(1).readonly(),
};
const phaseSchema = z
  .discriminatedUnion('status', [
    z.strictObject({
      ...phaseFields,
      status: z.enum(['planned', 'active', 'paused', 'blocked', 'needs-review']),
      evidence: texts.readonly(),
    }),
    z.strictObject({
      ...phaseFields,
      status: z.enum(['done', 'cancelled']),
      evidence: texts
        .min(1, 'Done/cancelled phases need evidence or a cancellation reason')
        .readonly(),
    }),
  ])
  .readonly();

const taskFields = {
  id: idSchema,
  phaseId: idSchema,
  title: text,
  requirements: idListSchema.min(1).readonly(),
  dependsOn: idListSchema.readonly(),
  doneWhen: texts.min(1).readonly(),
};
const taskSchema = z
  .discriminatedUnion('status', [
    z.strictObject({
      ...taskFields,
      status: z.enum(['pending', 'active', 'paused', 'blocked', 'needs-review']),
      evidence: texts.readonly(),
    }),
    z.strictObject({
      ...taskFields,
      status: z.enum(['done', 'cancelled']),
      evidence: texts
        .min(1, 'Done/cancelled tasks need evidence or a cancellation reason')
        .readonly(),
    }),
  ])
  .readonly();

export const documentSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    workId: idSchema,
    spec: z
      .strictObject({
        revision: text,
        request: text,
        constraints: texts.readonly(),
        requirements: z.array(requirementSchema).min(1).readonly(),
        sources: texts.readonly(),
      })
      .readonly(),
    scope: z
      .strictObject({
        id: idSchema,
        goal: text,
      })
      .readonly(),
    phases: z.array(phaseSchema).min(1).readonly(),
    tasks: z.array(taskSchema).readonly(),
    current: z
      .strictObject({
        phaseId: idSchema.nullable(),
        taskId: idSchema.nullable(),
      })
      .readonly(),
    memo: z
      .strictObject({
        currentWork: text,
        nextAction: text,
        decisions: texts.readonly(),
        blockers: texts.readonly(),
        retrieval: texts.readonly(),
        deadEnds: texts.readonly(),
      })
      .readonly(),
  })
  .readonly();

export type Document = z.infer<typeof documentSchema>;
export type Requirement = Document['spec']['requirements'][number];
export type Phase = Document['phases'][number];
export type Task = Document['tasks'][number];
