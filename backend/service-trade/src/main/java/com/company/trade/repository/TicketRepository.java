package com.company.trade.repository;

import com.company.trade.entity.Ticket;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // T011 동시성 제어: 티켓 행에 비관적 쓰기 락(SELECT FOR UPDATE)을 획득한다.
    // Deal 생성 직전 이 락을 통해 동일 티켓에 대한 동시 요청을 직렬화한다.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.ticketId = :ticketId")
    Optional<Ticket> findByIdWithPessimisticLock(@Param("ticketId") Long ticketId);
}
