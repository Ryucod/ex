package com.core.epril.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ekayworks.ex.domain.User;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;
import java.time.LocalDateTime;


@Setter @Getter
@MappedSuperclass
@EqualsAndHashCode(of = {}, callSuper = true)
public class AuditEntity extends AbstractEntity {
	/**
	 * created on
	 */
	LocalDateTime created;

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="created_by")
	User createdBy;
	
	/**
	 * updated on
	 */
	@JsonIgnore
	LocalDateTime updated;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="updated_by")
    User updatedBy;
}
