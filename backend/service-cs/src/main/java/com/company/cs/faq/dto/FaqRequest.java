package com.company.cs.faq.dto;

public class FaqRequest {

    private String category;
    private String question;
    private String answer;
    private Integer sortOrder;

    public String getCategory() {
        return category;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    // 테스트용 setter
    public void setCategory(String category) {
        this.category = category;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}