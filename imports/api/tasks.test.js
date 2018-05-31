/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';

import { Tasks } from './tasks.js';

if (Meteor.isServer) {
    describe('Tasks', () => {
        describe('methods', () => {
            const userId = Random.id();

            beforeEach(() => Tasks.remove({}) );

            it('create task', () => {
                let text = 'test task';
                
                const insertTask = Meteor.server.method_handlers['tasks.insert'];

                const invocation = { userId };

                // Run the method with `this` set to the fake invocation
                insertTask.apply(invocation, [text]);

                // Verify that the method does what we expected
                assert.equal(Tasks.find({text: text}).count(), 1);
            });

            it('update task', () => {
                const taskId = Tasks.insert({
                    text: 'test task',
                    createdAt: new Date(),
                    owner: userId
                });

                const setChecked = Meteor.server.method_handlers['tasks.setChecked'];

                setChecked.apply({}, [taskId, true]);
                assert.equal(Tasks.findOne(taskId).checked, true);

                setChecked.apply({}, [taskId, false]);
                assert.equal(Tasks.findOne(taskId).checked, false);
            });

            it('delete task', () => {
                let taskId = Tasks.insert({
                    text: 'test task',
                    createdAt: new Date(),
                    owner: userId
                });
                // Find the internal implementation of the task method so we can
                // test it in isolation
                const deleteTask = Meteor.server.method_handlers['tasks.remove'];

                // Set up a fake method invocation that looks like what the method expects
                const invocation = { userId };

                // Run the method with `this` set to the fake invocation
                deleteTask.apply(invocation, [taskId]);

                // Verify that the method does what we expected
                assert.equal(Tasks.find().count(), 0);
            });

        });
    });
}
