import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {solverID, solve, stopSolve, ping} from '../src/index.js';
import helpers from '../src/helpers.js';
import fs from 'fs';

const sessionId = 1;
const requestId = 1;
const userId = 1;

helpers.query = jest.fn();
fs.writeFileSync = jest.fn();
const publishFn = jest.fn();

describe("Minizinc Solver Tests", () => {
    beforeEach(async () => {
        helpers.query.mockClear();
        fs.writeFileSync.mockClear();
        publishFn.mockClear();
    })

    /** Solve */
    it("Should write to the filesystem when solving", async () => {
        //Call the solve function.
        const msg = {solverID: solverID, problemID: 1, model: "foo", data: "bar",
                    solve: "solver", flagS: false, flagF: false, cpus: 10, memory: 1};
        await solve(msg, publishFn);

        //Expect that the database has been queried. 
        expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it("Should publish a solver-pong response when stopping a solver", async () => {
        const msg = {solverID: solverID, problemID: 1, model: "foo", data: "bar",
                    solve: "solver", flagS: false, flagF: false, cpus: 10, memory: 1};
        await stopSolve(msg, publishFn);

        //Expect the correct response to be published
        expect(publishFn).toHaveBeenCalledTimes(1);
        expect(publishFn).toHaveBeenCalledWith("solver-pong-response", {
            solverID,
            busy: false
        })
    });

    it("Should publish a solver-pong response when pinging a solver", async () => {
        const msg = {solverID: solverID, problemID: 1, model: "foo", data: "bar",
                    solve: "solver", flagS: false, flagF: false, cpus: 10, memory: 1};
        await ping(msg, publishFn);

        //Expect the correct response to be published
        expect(publishFn).toHaveBeenCalledTimes(1);
        expect(publishFn).toHaveBeenCalledWith("solver-pong-response", {
            solverID,
            problemID: -1
        })
    });
})