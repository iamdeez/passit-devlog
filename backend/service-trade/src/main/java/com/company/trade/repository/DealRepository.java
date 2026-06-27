package com.company.trade.repository;

import com.company.trade.entity.Deal;
import com.company.trade.entity.DealStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DealRepository extends JpaRepository<Deal, Long> {

    Optional<Deal> findByTicketIdAndBuyerId(Long ticketId, Long buyerId);

    Optional<Deal> findByTicketIdAndDealStatus(Long ticketId, DealStatus dealStatus);

    boolean existsByTicketIdAndDealStatus(Long ticketId, DealStatus dealStatus);

    List<Deal> findByBuyerIdAndDealStatus(Long buyerId, DealStatus dealStatus);

    List<Deal> findBySellerIdAndDealStatus(Long sellerId, DealStatus dealStatus);

    List<Deal> findByBuyerId(Long buyerId);

    List<Deal> findBySellerId(Long sellerId);
}
