package com.chemical.workpermit.config;

import com.chemical.workpermit.enums.PermitEvent;
import com.chemical.workpermit.enums.PermitStatus;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.StateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

import java.util.EnumSet;

@Configuration
@EnableStateMachine(name = "permitStateMachine")
public class StateMachineConfig extends StateMachineConfigurerAdapter<PermitStatus, PermitEvent> {

    @Override
    public void configure(StateMachineConfigurationConfigurer<PermitStatus, PermitEvent> config) throws Exception {
        config
            .withConfiguration()
            .autoStartup(true)
            .machineId("permitStateMachine");
    }

    @Override
    public void configure(StateMachineStateConfigurer<PermitStatus, PermitEvent> states) throws Exception {
        states
            .withStates()
                .initial(PermitStatus.DRAFT)
                .states(EnumSet.allOf(PermitStatus.class))
                .end(PermitStatus.CLOSED)
                .end(PermitStatus.CANCELLED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<PermitStatus, PermitEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(PermitStatus.DRAFT).target(PermitStatus.PENDING_APPROVAL).event(PermitEvent.SUBMIT)
                .and()
            .withExternal()
                .source(PermitStatus.PENDING_APPROVAL).target(PermitStatus.GAS_TEST_PENDING).event(PermitEvent.APPROVE)
                .and()
            .withExternal()
                .source(PermitStatus.PENDING_APPROVAL).target(PermitStatus.DRAFT).event(PermitEvent.REJECT)
                .and()
            .withExternal()
                .source(PermitStatus.GAS_TEST_PENDING).target(PermitStatus.ISOLATION_PENDING).event(PermitEvent.RECORD_GAS_TEST)
                .and()
            .withExternal()
                .source(PermitStatus.ISOLATION_PENDING).target(PermitStatus.READY_TO_START).event(PermitEvent.CONFIRM_ISOLATION)
                .and()
            .withExternal()
                .source(PermitStatus.READY_TO_START).target(PermitStatus.IN_PROGRESS).event(PermitEvent.START_WORK)
                .and()
            .withExternal()
                .source(PermitStatus.IN_PROGRESS).target(PermitStatus.IN_PROGRESS).event(PermitEvent.RECORD_ENTRY)
                .and()
            .withExternal()
                .source(PermitStatus.IN_PROGRESS).target(PermitStatus.IN_PROGRESS).event(PermitEvent.RECORD_EXIT)
                .and()
            .withExternal()
                .source(PermitStatus.IN_PROGRESS).target(PermitStatus.PENDING_RESUME).event(PermitEvent.RECORD_EXIT)
                .and()
            .withExternal()
                .source(PermitStatus.PENDING_RESUME).target(PermitStatus.RESUME_CONFIRMED).event(PermitEvent.CONFIRM_RESUME)
                .and()
            .withExternal()
                .source(PermitStatus.RESUME_CONFIRMED).target(PermitStatus.IN_PROGRESS).event(PermitEvent.START_WORK)
                .and()
            .withExternal()
                .source(PermitStatus.RESUME_CONFIRMED).target(PermitStatus.CLOSING).event(PermitEvent.CLOSE)
                .and()
            .withExternal()
                .source(PermitStatus.IN_PROGRESS).target(PermitStatus.CLOSING).event(PermitEvent.CLOSE)
                .and()
            .withExternal()
                .source(PermitStatus.CLOSING).target(PermitStatus.CLOSED).event(PermitEvent.CLOSE)
                .and()
            .withExternal()
                .source(PermitStatus.DRAFT).target(PermitStatus.CANCELLED).event(PermitEvent.CANCEL)
                .and()
            .withExternal()
                .source(PermitStatus.PENDING_APPROVAL).target(PermitStatus.CANCELLED).event(PermitEvent.CANCEL);
    }
}
