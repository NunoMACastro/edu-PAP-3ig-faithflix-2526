/**
 * @file Testes da fila de progresso serial/coalescida.
 */

import { describe, expect, it, vi } from "vitest";
import { createProgressQueue } from "./progressQueue.js";

/** @returns {{ promise: Promise<void>, resolve: () => void, reject: (error: Error) => void }} Deferred. */
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

describe("createProgressQueue", () => {
    it("serializa e coalesce para a posição mais recente", async () => {
        const first = deferred();
        const second = deferred();
        const save = vi.fn()
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        const queue = createProgressQueue(save);

        const firstWrite = queue.enqueue(10);
        await Promise.resolve();
        const coalescedA = queue.enqueue(20);
        const coalescedB = queue.enqueue(30);
        expect(save).toHaveBeenCalledTimes(1);

        first.resolve();
        await firstWrite;
        await Promise.resolve();
        expect(save).toHaveBeenNthCalledWith(2, 30);
        second.resolve();
        await Promise.all([coalescedA, coalescedB]);
        expect(queue.getLastSaved()).toBe(30);
    });

    it("só avança o marcador depois de sucesso e recupera após falha", async () => {
        const save = vi.fn()
            .mockRejectedValueOnce(new Error("offline"))
            .mockResolvedValueOnce(undefined);
        const queue = createProgressQueue(save);

        await expect(queue.enqueue(15)).rejects.toThrow("offline");
        expect(queue.getLastSaved()).toBe(0);
        await expect(queue.enqueue(18)).resolves.toBe(18);
        expect(queue.getLastSaved()).toBe(18);
    });

    it("faz flush final e ignora novas escritas depois de fechar", async () => {
        const save = vi.fn().mockResolvedValue(undefined);
        const queue = createProgressQueue(save);

        await queue.close(42);
        await queue.enqueue(99);

        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith(42);
        expect(queue.getLastSaved()).toBe(42);
    });

    it("parte da posição já confirmada sem criar uma escrita artificial", () => {
        const save = vi.fn();
        const queue = createProgressQueue(save, { initialPosition: 27 });

        expect(queue.getLastSaved()).toBe(27);
        expect(save).not.toHaveBeenCalled();
    });
});
