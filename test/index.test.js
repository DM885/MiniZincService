import {solverID, solve, stopSolve, ping} from '../src/index.js';
import helpers from '../src/helpers.js';
import fs from 'fs';
import Solver from '../src/Solver.js';
import uid from 'uid-safe';

jest.mock('../src/Solver.js');
jest.mock('uid-safe');
uid.mockReturnValue(500);

const sessionId = 1;
const requestId = 1;
const userId = 1;

helpers.query = jest.fn();
fs.writeFileSync = jest.fn();
const publishFn = jest.fn();

describe("Minizinc Solver Tests", () => {
    beforeEach(async () => {
        Solver.mockClear();
        helpers.query.mockClear();
        fs.writeFileSync.mockClear();
        publishFn.mockClear();
    })

    // Solve
    it("Should start a solver instance when solve is called", async () => {
        //Call the solve function.
        const msg = {solverID: solverID, problemID: 1, model: "model.mzn", data: "data.dzn",
                    solver: false, flagS: false, flagF: false, cpuLimit: 5, memoryLimit: 100};
        await solve(msg, publishFn);

        //Expect that a solver has been started.
        expect(Solver).toHaveBeenCalledTimes(1);
    });

    // Because the first test causes the solve function to hang, other ones should return because the solver is busy.
    it("Second call should return undefined", async () => {
        //Call the solve function.
        const msg = {solverID: solverID, problemID: 1, model: "model.mzn", data: "data.dzn",
                    solver: false, flagS: false, flagF: false, cpuLimit: 5, memoryLimit: 100};


        //Expect that the database has been queried.
        expect(await solve(msg, publishFn)).toBeUndefined();
    });


    it("Should publish a solver-pong-response when called to show it is busy", async () => {
        //Call the solve function.
        const msg = {solverID: solverID, problemID: 1, model: "model.mzn", data: "data.dzn",
                    solver: false, flagS: false, flagF: false, cpuLimit: 5, memoryLimit: 100};
        await solve(msg, publishFn);

        //Expect the correct response to be published
        expect(publishFn).toHaveBeenCalledTimes(1);
        expect(publishFn).toHaveBeenCalledWith("solver-pong-response", {
            solverID,
            problemID: msg.problemID
        })
    });

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
                    solver: false, flagS: false, flagF: false, cpus: 10, memory: 1};
        await stopSolve(msg, publishFn);

        //Expect the correct response to be published
        expect(publishFn).toHaveBeenCalledTimes(1);
        expect(publishFn).toHaveBeenCalledWith("solver-pong-response", {
            solverID,
            problemID: -1
        })
    });

    it("Should publish a solver-pong response when pinging a solver", async () => {
        const msg = {solverID: solverID, problemID: 1, model: "foo", data: "bar",
                    solver: false, flagS: false, flagF: false, cpus: 10, memory: 1};
        await ping(msg, publishFn);

        //Expect the correct response to be published
        expect(publishFn).toHaveBeenCalledTimes(1);
        expect(publishFn).toHaveBeenCalledWith("solver-pong-response", {
            solverID,
            problemID: -1
        })
    });
})
