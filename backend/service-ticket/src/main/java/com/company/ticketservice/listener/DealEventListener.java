package com.company.ticketservice.listener;

import com.company.sns.EventMessage;
import com.company.ticketservice.service.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("!local & !test")  // 로컬 및 테스트 환경에서는 AWS SQS 리스너 비활성화
@RequiredArgsConstructor
public class DealEventListener {

    private final ObjectMapper objectMapper;
    private final TicketService ticketService;

    @SqsListener("${SQS_TICKET_DEAL_EVENTS_QUEUE_URL}")
    public void handleDealEvent(String messageJson) {
        try {
            // SNS wraps SQS messages, so we need to extract the Message field
            com.fasterxml.jackson.databind.JsonNode snsMessage = objectMapper.readTree(messageJson);
            String actualMessage = snsMessage.has("Message")
                ? snsMessage.get("Message").asText()
                : messageJson;

            EventMessage event = objectMapper.readValue(actualMessage, EventMessage.class);

            log.info("[SQS-EVENT] Received deal event: {}", event.getEventType());

            switch (event.getEventType()) {
                case "deal.confirmed":
                    handleDealConfirmed(event);
                    break;
                default:
                    log.warn("[SQS-EVENT] Unknown event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("[SQS-ERROR] Failed to process deal event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process deal event", e);
        }
    }

    private void handleDealConfirmed(EventMessage event) {
        Long ticketId = getLongValue(event.getData().get("ticketId"));
        Long dealId = getLongValue(event.getData().get("dealId"));

        log.info("[DEAL-CONFIRMED] Deal ID: {}, Ticket ID: {}", dealId, ticketId);

        if (ticketId == null) {
            log.warn("[DEAL-CONFIRMED] ticketId 누락 — 티켓 상태 업데이트 건너뜀. Deal ID: {}", dealId);
            return;
        }

        ticketService.markTicketAsUsed(ticketId);
        log.info("[DEAL-CONFIRMED] 티켓 상태를 USED로 변경 완료. Ticket ID: {}", ticketId);
    }

    private Long getLongValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(value.toString());
    }
}
