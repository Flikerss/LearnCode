import React from "react";
import "./Team.css";

export default function Team({ data }) {
    return (
        <div className="team">
            <h2>Наша команда</h2>
            <div className="team-members">
                {data.map((member) =>  (
                    <div key={member.name} className="member-card">
                        <img className="member-photo" src={member.photo} alt={member.name} />
                        <h3>{member.name}</h3>
                        <p>{member.role}</p>
                    </div>
                )
                )}

            </div>
        </div>
    )
}